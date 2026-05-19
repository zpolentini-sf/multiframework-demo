global with sharing class GetCustomerSuccessDataAction {

    global class ActionRequest {
        @InvocableVariable(label='Project Id' required=true description='Id of the Project__c record to analyze.')
        global String projectId;
    }

    global class ActionResult {
        @InvocableVariable(label='Prompt String' description='Full prompt string to pass to the AI model.')
        global String promptString;
        @InvocableVariable(label='Context JSON' description='JSON string with all project and token data fields for the response.')
        global String contextJson;
    }

    @InvocableMethod(
        label='Get Customer Success Data'
        description='Queries a Project__c record and its related Account TokenUsage__c to build a customer success AI prompt and context payload. Used by the Customer Success Highlight Flow.'
    )
    global static List<ActionResult> getData(List<ActionRequest> requests) {
        List<ActionResult> results = new List<ActionResult>();

        for (ActionRequest req : requests) {
            if (String.isBlank(req.projectId)) {
                results.add(new ActionResult());
                continue;
            }

            List<Project__c> projects = [
                SELECT Id, Name, Status__c, CompletionPct__c, StartDate__c, DueDate__c,
                       Description__c, Account__c, Account__r.Name
                FROM Project__c
                WHERE Id = :req.projectId
                LIMIT 1
            ];

            if (projects.isEmpty()) {
                results.add(new ActionResult());
                continue;
            }

            Project__c p = projects[0];
            String account    = p.Account__r != null ? p.Account__r.Name : '';
            String status     = p.Status__c   != null ? p.Status__c : 'On Track';
            Decimal compPct   = p.CompletionPct__c != null ? p.CompletionPct__c : 0;
            String startDate  = p.StartDate__c != null ? String.valueOf(p.StartDate__c) : 'N/A';
            String dueDate    = p.DueDate__c   != null ? String.valueOf(p.DueDate__c)   : 'N/A';
            Boolean isOverdue = p.DueDate__c   != null && p.DueDate__c < Date.today() && p.Status__c != 'Complete';

            // Highest token record for this account
            Decimal tokensUsed = 0, tokenLimit = 0, loginPct = 0;
            if (p.Account__c != null) {
                List<TokenUsage__c> tokens = [
                    SELECT TokensUsed__c, TokenLimit__c, LoginPercentage__c
                    FROM TokenUsage__c
                    WHERE Account__c = :p.Account__c
                    ORDER BY TokensUsed__c DESC NULLS LAST
                    LIMIT 1
                ];
                if (!tokens.isEmpty()) {
                    tokensUsed = tokens[0].TokensUsed__c  != null ? tokens[0].TokensUsed__c  : 0;
                    tokenLimit = tokens[0].TokenLimit__c  != null ? tokens[0].TokenLimit__c  : 0;
                    loginPct   = tokens[0].LoginPercentage__c != null ? tokens[0].LoginPercentage__c : 0;
                }
            }

            Decimal queries    = tokensUsed / 500;
            Decimal hoursSaved = (queries * 15) / 60;
            Decimal usagePct   = tokenLimit > 0 ? ((tokensUsed / tokenLimit) * 100).setScale(1) : 0;

            Integer projectsOnTrack = 0;
            if (p.Account__c != null) {
                projectsOnTrack = [
                    SELECT COUNT() FROM Project__c
                    WHERE Account__c = :p.Account__c
                      AND Status__c IN ('On Track', 'Complete')
                ];
            }

            String projContext =
                'Project: '                      + p.Name + '\n' +
                'Account: '                      + account + '\n' +
                'Status: '                       + status + '\n' +
                'Completion: '                   + compPct.setScale(1) + '%\n' +
                'Start Date: '                   + startDate + '\n' +
                'Due Date: '                     + dueDate + (isOverdue ? ' [OVERDUE]' : '') + '\n' +
                'Token consumption: '            + tokensUsed.setScale(0) + ' tokens\n' +
                'Token limit: '                  + tokenLimit.setScale(0) + '\n' +
                'Token usage %: '                + usagePct + '%\n' +
                'Login rate: '                   + loginPct.setScale(1) + '%\n' +
                'Queries completed (est.): '     + queries.setScale(0) + '\n' +
                'Estimated hours saved: '        + hoursSaved.setScale(1) + '\n' +
                'Active projects this account: ' + projectsOnTrack;

            String prompt =
                'You are a customer success analyst writing a brief for an account manager. ' +
                'Analyze this customer project and return ONLY a JSON object — no markdown, no explanation.\n\n' +
                'Return this exact structure:\n' +
                '{"headline":"one punchy sentence about the project momentum or outcome (max 12 words)",' +
                '"summary":"2-3 sentence narrative covering project health, token adoption, and business impact",' +
                '"health":"strong",' +
                '"actions":["specific next step 1","specific next step 2"]}\n\n' +
                'For health: use "strong" if on track/complete/high completion, "on_track" if progressing but slow, ' +
                '"at_risk" if overdue or stalled.\n' +
                'For actions: be specific — reference the project name and account, suggest concrete customer success ' +
                'activities such as QBR scheduling, expansion conversation, adoption coaching, or escalation. ' +
                'Today is ' + String.valueOf(Date.today()) + '.\n\n' + projContext;

            Map<String, Object> ctx = new Map<String, Object>{
                'id'               => p.Id,
                'name'             => p.Name,
                'account'          => account,
                'status'           => status,
                'completionPct'    => compPct,
                'startDate'        => startDate,
                'dueDate'          => dueDate,
                'tokensUsed'       => tokensUsed.setScale(0),
                'tokenLimit'       => tokenLimit.setScale(0),
                'queriesCompleted' => queries.setScale(0),
                'hoursSaved'       => hoursSaved.setScale(1),
                'projectsOnTrack'  => projectsOnTrack
            };

            ActionResult res  = new ActionResult();
            res.promptString  = prompt;
            res.contextJson   = JSON.serialize(ctx);
            results.add(res);
        }

        return results;
    }
}
