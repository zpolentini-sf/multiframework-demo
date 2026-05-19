@RestResource(urlMapping='/customer-success/*')
global with sharing class CustomerSuccessController {

    @HttpPost
    global static void getHighlights() {
        RestContext.response.addHeader('Content-Type', 'application/json');

        try {
            // ── 1. Select 3 distinct projects across 3 success signals ──────

            // Signal A — best completion progress
            List<Project__c> progressCandidates = [
                SELECT Id, Name, Status__c, CompletionPct__c, StartDate__c, DueDate__c,
                       Description__c, Account__c, Account__r.Name
                FROM Project__c
                WHERE Status__c IN ('On Track', 'Complete')
                ORDER BY CompletionPct__c DESC NULLS LAST
                LIMIT 5
            ];

            if (progressCandidates.isEmpty()) {
                RestContext.response.responseBody = Blob.valueOf('[]');
                return;
            }

            // All active projects for token-signal lookup (first project per account)
            List<Project__c> allActive = [
                SELECT Id, Name, Status__c, CompletionPct__c, Account__c, Account__r.Name
                FROM Project__c
                WHERE Status__c IN ('On Track', 'Complete')
                ORDER BY CompletionPct__c DESC NULLS LAST
                LIMIT 200
            ];

            Map<Id, Project__c> accountToProject = new Map<Id, Project__c>();
            for (Project__c p : allActive) {
                if (p.Account__c != null && !accountToProject.containsKey(p.Account__c)) {
                    accountToProject.put(p.Account__c, p);
                }
            }

            // Token data per account (highest-usage record)
            Map<Id, TokenUsage__c> accountToToken = new Map<Id, TokenUsage__c>();
            if (!accountToProject.isEmpty()) {
                for (TokenUsage__c tu : [
                    SELECT Id, Account__c, TokensUsed__c, TokenLimit__c, LoginPercentage__c
                    FROM TokenUsage__c
                    WHERE Account__c IN :accountToProject.keySet()
                    ORDER BY TokensUsed__c DESC NULLS LAST
                ]) {
                    if (!accountToToken.containsKey(tu.Account__c)) {
                        accountToToken.put(tu.Account__c, tu);
                    }
                }
            }

            // Build sortable pairs for token-based signals
            List<Map<String, Object>> tokenPairs = new List<Map<String, Object>>();
            for (Id accId : accountToProject.keySet()) {
                TokenUsage__c tu = accountToToken.get(accId);
                if (tu == null) continue;
                Decimal tokensUsed = tu.TokensUsed__c != null ? tu.TokensUsed__c : 0;
                Decimal queries    = tokensUsed / 500;
                tokenPairs.add(new Map<String, Object>{
                    'project'    => accountToProject.get(accId),
                    'tokensUsed' => tokensUsed,
                    'hoursSaved' => (queries * 15) / 60
                });
            }

            List<Map<String, Object>> byTokens = sortPairsBy(tokenPairs, 'tokensUsed');
            List<Map<String, Object>> byROI    = sortPairsBy(tokenPairs, 'hoursSaved');

            // Dedup-select 3 projects
            Set<Id> usedIds = new Set<Id>();
            List<Id> selectedIds = new List<Id>();

            // Slot 0 — best progress
            for (Project__c p : progressCandidates) {
                if (!usedIds.contains(p.Id)) {
                    usedIds.add(p.Id);
                    selectedIds.add(p.Id);
                    break;
                }
            }

            // Slot 1 — highest token consumption
            for (Map<String, Object> pair : byTokens) {
                Project__c p = (Project__c) pair.get('project');
                if (!usedIds.contains(p.Id)) {
                    usedIds.add(p.Id);
                    selectedIds.add(p.Id);
                    break;
                }
            }

            // Slot 2 — best ROI (hours saved)
            for (Map<String, Object> pair : byROI) {
                Project__c p = (Project__c) pair.get('project');
                if (!usedIds.contains(p.Id)) {
                    usedIds.add(p.Id);
                    selectedIds.add(p.Id);
                    break;
                }
            }

            // Fall back to any remaining active projects if fewer than 3 distinct signals
            if (selectedIds.size() < 3) {
                for (Project__c p : allActive) {
                    if (selectedIds.size() >= 3) break;
                    if (!usedIds.contains(p.Id)) {
                        usedIds.add(p.Id);
                        selectedIds.add(p.Id);
                    }
                }
            }

            if (selectedIds.isEmpty()) {
                RestContext.response.responseBody = Blob.valueOf('[]');
                return;
            }

            // ── 2. Invoke the flow for each selected project ─────────────────
            List<Map<String, Object>> results = new List<Map<String, Object>>();

            for (Id projId : selectedIds) {
                Map<String, Object> flowInputs = new Map<String, Object>{
                    'projectId' => (String) projId
                };

                Flow.Interview interview = Flow.Interview.createInterview(
                    'CustomerSuccessHighlightFlow', flowInputs
                );
                interview.start();

                String aiResponse  = (String) interview.getVariableValue('aiResponse');
                String contextJson = (String) interview.getVariableValue('contextJson');

                // Parse context payload built by the action
                Map<String, Object> ctx = new Map<String, Object>();
                if (String.isNotBlank(contextJson)) {
                    try {
                        ctx = (Map<String, Object>) JSON.deserializeUntyped(contextJson);
                    } catch (Exception e) { }
                }

                // Parse AI response
                Map<String, Object> highlight = new Map<String, Object>();
                if (String.isNotBlank(aiResponse)) {
                    try {
                        highlight = (Map<String, Object>) JSON.deserializeUntyped(extractJson(aiResponse));
                    } catch (Exception e) {
                        highlight = new Map<String, Object>{
                            'headline' => ctx.containsKey('name') ? (String) ctx.get('name') + ' is progressing well' : 'Project update',
                            'summary'  => aiResponse,
                            'health'   => 'on_track',
                            'actions'  => new List<String>{ 'Schedule check-in call', 'Review project timeline' }
                        };
                    }
                }

                // Merge context fields into the highlight map
                for (String key : ctx.keySet()) {
                    if (!highlight.containsKey(key)) {
                        highlight.put(key, ctx.get(key));
                    }
                }
                // Always ensure context fields win for data fields (not AI fields)
                for (String key : new List<String>{
                    'id','name','account','status','completionPct','startDate','dueDate',
                    'tokensUsed','tokenLimit','queriesCompleted','hoursSaved','projectsOnTrack'
                }) {
                    if (ctx.containsKey(key)) highlight.put(key, ctx.get(key));
                }

                results.add(highlight);
            }

            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(results));

        } catch (Exception e) {
            RestContext.response.statusCode = 500;
            RestContext.response.responseBody = Blob.valueOf(
                '{"error":"' + e.getMessage().replace('"', '\\"') + '"}'
            );
        }
    }

    private static List<Map<String, Object>> sortPairsBy(
        List<Map<String, Object>> pairs, String key
    ) {
        List<Map<String, Object>> sorted = new List<Map<String, Object>>(pairs);
        for (Integer i = 1; i < sorted.size(); i++) {
            Map<String, Object> curr = sorted[i];
            Decimal currVal = curr.get(key) != null ? (Decimal) curr.get(key) : 0;
            Integer j = i - 1;
            while (j >= 0) {
                Decimal jVal = sorted[j].get(key) != null ? (Decimal) sorted[j].get(key) : 0;
                if (jVal < currVal) {
                    sorted[j + 1] = sorted[j];
                    j--;
                } else {
                    break;
                }
            }
            sorted[j + 1] = curr;
        }
        return sorted;
    }

    private static String extractJson(String raw) {
        if (raw == null) return '{}';
        String trimmed = raw.trim();
        if (trimmed.startsWith('```')) {
            Integer start    = trimmed.indexOf('\n');
            Integer fenceEnd = trimmed.lastIndexOf('```');
            if (start > -1 && fenceEnd > start) {
                trimmed = trimmed.substring(start + 1, fenceEnd).trim();
            }
        }
        return trimmed;
    }
}
