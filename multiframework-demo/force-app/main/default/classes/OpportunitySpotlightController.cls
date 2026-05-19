@RestResource(urlMapping='/opportunity-spotlight/*')
global with sharing class OpportunitySpotlightController {

    @HttpPost
    global static void getSpotlights() {
        RestContext.response.addHeader('Content-Type', 'application/json');

        try {
            List<Opportunity> opps = [
                SELECT Id, Name, StageName, Amount, CloseDate, Probability,
                       NextStep, LastActivityDate, Account.Name
                FROM Opportunity
                WHERE IsClosed = false
                ORDER BY Amount DESC NULLS LAST
                LIMIT 3
            ];

            if (opps.isEmpty()) {
                RestContext.response.responseBody = Blob.valueOf('[]');
                return;
            }

            String today = String.valueOf(Date.today());
            List<Map<String, Object>> results = new List<Map<String, Object>>();

            for (Opportunity o : opps) {
                String amount = o.Amount != null ? '$' + String.valueOf(o.Amount.setScale(0)) : 'N/A';
                String closeDate = o.CloseDate != null ? String.valueOf(o.CloseDate) : 'N/A';
                Boolean isOverdue = o.CloseDate != null && o.CloseDate < Date.today();
                String prob = o.Probability != null ? String.valueOf(o.Probability.intValue()) + '%' : 'N/A';
                String account = o.Account != null ? o.Account.Name : '';
                String nextStep = String.isBlank(o.NextStep) ? 'no next step recorded' : o.NextStep;
                String lastActivity = o.LastActivityDate != null
                    ? 'last activity: ' + String.valueOf(o.LastActivityDate)
                    : 'no recent activity';

                String oppContext =
                    'Deal: ' + o.Name + '\n' +
                    'Account: ' + account + '\n' +
                    'Stage: ' + o.StageName + '\n' +
                    'Amount: ' + amount + '\n' +
                    'Close date: ' + closeDate + (isOverdue ? ' [OVERDUE]' : '') + '\n' +
                    'Probability: ' + prob + '\n' +
                    'Next step: ' + nextStep + '\n' +
                    'Activity: ' + lastActivity;

                String prompt =
                    'You are a sales intelligence analyst writing a brief for a sales rep. ' +
                    'Analyze this opportunity and return ONLY a JSON object — no markdown, no explanation.\n\n' +
                    'Return this exact structure:\n' +
                    '{"headline":"one punchy sentence summarizing the deal health (newspaper headline style, max 12 words)",' +
                    '"summary":"2-3 sentence narrative health overview with specific context from the data",' +
                    '"health":"at_risk",' +
                    '"actions":["specific recommended action 1","specific recommended action 2"]}\n\n' +
                    'For health: use "at_risk" if overdue/stalled/low probability, "strong" if high probability/recent activity/clear next step, "on_track" otherwise.\n' +
                    'For actions: be specific — include deal name, suggest concrete activities (call, email, meeting, proposal update). ' +
                    'Today is ' + today + '.\n\n' + oppContext;

                String raw = invokePromptTemplate(prompt);

                Map<String, Object> spotlight;
                try {
                    spotlight = (Map<String, Object>) JSON.deserializeUntyped(extractJson(raw));
                } catch (Exception e) {
                    spotlight = new Map<String, Object>{
                        'headline' => o.Name + ' needs attention',
                        'summary' => raw,
                        'health' => 'on_track',
                        'actions' => new List<String>{ 'Review opportunity details', 'Update next step' }
                    };
                }

                spotlight.put('id', o.Id);
                spotlight.put('name', o.Name);
                spotlight.put('account', account);
                spotlight.put('amount', amount);
                spotlight.put('stage', o.StageName);
                spotlight.put('closeDate', closeDate);
                results.add(spotlight);
            }

            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(results));

        } catch (Exception e) {
            RestContext.response.statusCode = 500;
            RestContext.response.responseBody = Blob.valueOf(
                '{"error":"' + e.getMessage().replace('"', '\\"') + '"}'
            );
        }
    }

    private static String extractJson(String raw) {
        if (raw == null) return '{}';
        String trimmed = raw.trim();
        if (trimmed.startsWith('```')) {
            Integer start = trimmed.indexOf('\n');
            Integer fenceEnd = trimmed.lastIndexOf('```');
            if (start > -1 && fenceEnd > start) {
                trimmed = trimmed.substring(start + 1, fenceEnd).trim();
            }
        }
        return trimmed;
    }

    private static String invokePromptTemplate(String prompt) {
        Invocable.Action action = Invocable.Action.createCustomAction('generatePromptResponse', 'opportunityInsightsFreeform');
        action.setInvocationParameter('Input:prompt', prompt);
        action.setInvocationParameter('isPreviewOnly', false);

        List<Invocable.Action.Result> results = action.invoke();
        if (results == null || results.isEmpty()) return '{}';

        Invocable.Action.Result result = results[0];
        if (!result.isSuccess()) return '{}';
        return (String) result.getOutputParameters().get('promptResponse');
    }
}
