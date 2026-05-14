@RestResource(urlMapping='/opportunity-summary/*')
global with sharing class OpportunitySummaryController {

    @HttpPost
    global static void getInsights() {
        RestContext.response.addHeader('Content-Type', 'application/json');

        try {
            List<Opportunity> opps = [
                SELECT Name, StageName, Amount, CloseDate, Probability,
                       NextStep, LastActivityDate, Account.Name
                FROM Opportunity
                WHERE IsClosed = false
                ORDER BY Amount DESC NULLS LAST
                LIMIT 50
            ];

            if (opps.isEmpty()) {
                Map<String, Object> empty = new Map<String, Object>{
                    'health' => new Map<String, Object>{
                        'summary' => 'No open opportunities found in your pipeline.',
                        'totalValue' => '$0',
                        'dealCount' => 0,
                        'flags' => new List<Object>()
                    },
                    'nextSteps' => new List<Object>()
                };
                RestContext.response.responseBody = Blob.valueOf(JSON.serialize(empty));
                return;
            }

            // Compute totals in Apex so the LLM doesn't have to
            Decimal totalValue = 0;
            String today = String.valueOf(Date.today());
            String oppLines = '';
            for (Opportunity o : opps) {
                if (o.Amount != null) totalValue += o.Amount;
                String amount = o.Amount != null ? '$' + String.valueOf(o.Amount.setScale(0)) : 'N/A';
                String closeDate = o.CloseDate != null ? String.valueOf(o.CloseDate) : 'N/A';
                Boolean isOverdue = o.CloseDate != null && o.CloseDate < Date.today();
                String prob = o.Probability != null ? String.valueOf(o.Probability.intValue()) + '%' : 'N/A';
                String account = o.Account != null ? ' (' + o.Account.Name + ')' : '';
                String nextStep = String.isBlank(o.NextStep) ? 'NO next step recorded' : 'next step: ' + o.NextStep;
                String lastActivity = o.LastActivityDate != null
                    ? 'last activity: ' + String.valueOf(o.LastActivityDate)
                    : 'no recent activity';
                oppLines += '- ' + o.Name + account + ': ' + o.StageName + ', ' + amount +
                            ', closes ' + closeDate + (isOverdue ? ' [OVERDUE]' : '') +
                            ', ' + prob + ' probability, ' + nextStep + ', ' + lastActivity + '\n';
            }

            String totalStr = '$' + String.valueOf(totalValue.setScale(0));

            // HEALTH: ask for structured JSON
            String healthPrompt =
                'You are a sales operations analyst. Analyze these open opportunities and return ONLY a JSON object — no markdown, no explanation, just the raw JSON.\n\n' +
                'Return this exact structure:\n' +
                '{"summary":"2-3 sentence overview of pipeline health","flags":[{"label":"short flag title","detail":"one sentence explaining the issue"}]}\n\n' +
                'Include up to 5 flags for: overdue deals, stalled deals (low probability for their stage), missing activity, concentration risk, or other concerns. ' +
                'Be specific — use deal names and amounts. Today is ' + today + '.\n\nOpportunities:\n' + oppLines;

            // NEXT STEPS: ask for structured JSON, top 5 only
            String nextStepPrompt =
                'You are a sales coach. Identify the 5 most critical open opportunities with outdated or missing next steps. ' +
                'Return ONLY a JSON array — no markdown, no explanation, just the raw JSON.\n\n' +
                'Return this exact structure:\n' +
                '[{"dealName":"name","amount":"$X","issue":"what is wrong or missing","suggested":"specific recommended next action"}]\n\n' +
                'Today is ' + today + '. Prioritize overdue deals and high-value deals with no next step.\n\nOpportunities:\n' + oppLines;

            String healthRaw = invokePromptTemplate(healthPrompt);
            String nextStepRaw = invokePromptTemplate(nextStepPrompt);

            // Parse the AI JSON responses
            Object healthParsed;
            Object nextStepParsed;
            try {
                healthParsed = JSON.deserializeUntyped(extractJson(healthRaw));
            } catch (Exception e) {
                healthParsed = new Map<String, Object>{
                    'summary' => healthRaw,
                    'flags' => new List<Object>()
                };
            }
            try {
                nextStepParsed = JSON.deserializeUntyped(extractJson(nextStepRaw));
            } catch (Exception e) {
                nextStepParsed = new List<Object>();
            }

            // Assemble final response
            Map<String, Object> healthObj = (Map<String, Object>) healthParsed;
            healthObj.put('totalValue', totalStr);
            healthObj.put('dealCount', opps.size());

            Map<String, Object> finalResponse = new Map<String, Object>{
                'health' => healthObj,
                'nextSteps' => nextStepParsed
            };
            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(finalResponse));

        } catch (Exception e) {
            RestContext.response.statusCode = 500;
            RestContext.response.responseBody = Blob.valueOf(
                '{"error":"' + e.getMessage().replace('"', '\\"') + '"}'
            );
        }
    }

    // Strip any markdown code fences the LLM might add around JSON
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
        if (!result.isSuccess()) {
            List<String> errors = new List<String>();
            for (Invocable.Action.Error e : result.getErrors()) errors.add(e.getMessage());
            return '{}';
        }
        return (String) result.getOutputParameters().get('promptResponse');
    }
}
