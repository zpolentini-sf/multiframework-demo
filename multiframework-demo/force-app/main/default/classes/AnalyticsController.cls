@RestResource(urlMapping='/analytics-summary/*')
global with sharing class AnalyticsController {

    @HttpGet
    global static void getSummary() {
        RestContext.response.addHeader('Content-Type', 'application/json');
        try {
            // Revenue: closed won
            Decimal revMonth = 0, revQuarter = 0, revYear = 0;
            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = true AND IsWon = true AND CloseDate = THIS_MONTH
            ]) { if (ar.get('total') != null) revMonth = (Decimal) ar.get('total'); }

            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = true AND IsWon = true AND CloseDate = THIS_QUARTER
            ]) { if (ar.get('total') != null) revQuarter = (Decimal) ar.get('total'); }

            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = true AND IsWon = true AND CloseDate = THIS_YEAR
            ]) { if (ar.get('total') != null) revYear = (Decimal) ar.get('total'); }

            // Pipeline: open opps
            Decimal pipeMonth = 0, pipeQuarter = 0, pipeYear = 0;
            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = false AND CloseDate = THIS_MONTH
            ]) { if (ar.get('total') != null) pipeMonth = (Decimal) ar.get('total'); }

            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = false AND CloseDate = THIS_QUARTER
            ]) { if (ar.get('total') != null) pipeQuarter = (Decimal) ar.get('total'); }

            for (AggregateResult ar : [
                SELECT SUM(Amount) total FROM Opportunity
                WHERE IsClosed = false AND CloseDate = THIS_YEAR
            ]) { if (ar.get('total') != null) pipeYear = (Decimal) ar.get('total'); }

            // Activities this week
            Integer calls = [SELECT COUNT() FROM Task WHERE Type = 'Call' AND ActivityDate = THIS_WEEK];
            Integer emails = [SELECT COUNT() FROM Task WHERE Type = 'Email' AND ActivityDate = THIS_WEEK];
            Integer meetingTasks = [SELECT COUNT() FROM Task WHERE Type = 'Meeting' AND ActivityDate = THIS_WEEK];
            Integer meetingEvents = [SELECT COUNT() FROM Event WHERE Type = 'Meeting' AND ActivityDate = THIS_WEEK];
            Integer meetings = meetingTasks + meetingEvents;

            // Quote counts
            Integer quoteDraft = [SELECT COUNT() FROM Quote WHERE Status = 'Draft'];
            Integer quoteInReview = [SELECT COUNT() FROM Quote WHERE Status = 'In Review'];
            Integer quotePresented = [SELECT COUNT() FROM Quote WHERE Status = 'Presented'];

            // Token usage
            Decimal totalLogin = 0, totalUsed = 0, totalLimit = 0;
            Integer tokenCount = 0;
            List<Map<String, Object>> accountTokens = new List<Map<String, Object>>();
            List<Map<String, Object>> nearLimit = new List<Map<String, Object>>();

            for (TokenUsage__c tu : [
                SELECT Id, Name, Account__r.Name, TokensUsed__c, TokenLimit__c, LoginPercentage__c
                FROM TokenUsage__c
                ORDER BY TokensUsed__c DESC NULLS LAST
            ]) {
                tokenCount++;
                if (tu.LoginPercentage__c != null) totalLogin += tu.LoginPercentage__c;
                if (tu.TokensUsed__c != null) totalUsed += tu.TokensUsed__c;
                if (tu.TokenLimit__c != null) totalLimit += tu.TokenLimit__c;
                Map<String, Object> row = new Map<String, Object>{
                    'id' => tu.Id,
                    'accountName' => tu.Account__r != null ? tu.Account__r.Name : tu.Name,
                    'tokensUsed' => tu.TokensUsed__c != null ? tu.TokensUsed__c : 0,
                    'tokenLimit' => tu.TokenLimit__c != null ? tu.TokenLimit__c : 1000000,
                    'loginPct' => tu.LoginPercentage__c != null ? tu.LoginPercentage__c : 0
                };
                accountTokens.add(row);
                if (tu.TokenLimit__c != null && tu.TokensUsed__c != null
                    && tu.TokenLimit__c > 0
                    && (tu.TokensUsed__c / tu.TokenLimit__c) >= 0.85) {
                    nearLimit.add(row);
                }
            }

            Decimal avgLogin = tokenCount > 0 ? (totalLogin / tokenCount).setScale(1) : 0;
            Decimal avgUsed = tokenCount > 0 ? (totalUsed / tokenCount).setScale(0) : 0;
            Decimal avgLimit = tokenCount > 0 ? (totalLimit / tokenCount).setScale(0) : 1000000;

            // Top contacts by token usage
            List<Map<String, Object>> topContacts = new List<Map<String, Object>>();
            for (ContactTokenUsage__c ctu : [
                SELECT Id, Contact__r.Name, TokenUsage__r.Account__r.Name, UsageAmount__c
                FROM ContactTokenUsage__c
                ORDER BY UsageAmount__c DESC NULLS LAST
                LIMIT 5
            ]) {
                topContacts.add(new Map<String, Object>{
                    'contactName' => ctu.Contact__r != null ? ctu.Contact__r.Name : 'Unknown',
                    'accountName' => ctu.TokenUsage__r != null && ctu.TokenUsage__r.Account__r != null
                        ? ctu.TokenUsage__r.Account__r.Name : '',
                    'usageAmount' => ctu.UsageAmount__c != null ? ctu.UsageAmount__c : 0
                });
            }

            Map<String, Object> result = new Map<String, Object>{
                'revenue' => new Map<String, Object>{
                    'month' => revMonth,
                    'quarter' => revQuarter,
                    'year' => revYear
                },
                'pipeline' => new Map<String, Object>{
                    'month' => pipeMonth,
                    'quarter' => pipeQuarter,
                    'year' => pipeYear
                },
                'activities' => new Map<String, Object>{
                    'calls' => calls,
                    'emails' => emails,
                    'meetings' => meetings
                },
                'quotes' => new Map<String, Object>{
                    'draft' => quoteDraft,
                    'awaitingApproval' => quoteInReview,
                    'awaitingSignature' => quotePresented
                },
                'tokens' => new Map<String, Object>{
                    'avgLoginPct' => avgLogin,
                    'avgTokensUsed' => avgUsed,
                    'avgTokenLimit' => avgLimit,
                    'accounts' => accountTokens,
                    'nearLimit' => nearLimit,
                    'topContacts' => topContacts
                }
            };

            RestContext.response.responseBody = Blob.valueOf(JSON.serialize(result));
        } catch (Exception e) {
            RestContext.response.statusCode = 500;
            RestContext.response.responseBody = Blob.valueOf(
                '{"error":"' + e.getMessage().replace('"', '\\"') + '"}'
            );
        }
    }
}
