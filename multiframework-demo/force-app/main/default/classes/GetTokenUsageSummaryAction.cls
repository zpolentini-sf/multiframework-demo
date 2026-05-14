global with sharing class GetTokenUsageSummaryAction {

    global class ActionRequest {
        @InvocableVariable(label='Input (unused)' description='Optional input; pass empty string.')
        global String input;
    }

    global class ActionResult {
        @InvocableVariable(label='Token Usage Summary' description='JSON string with categorized account token usage: expansion candidates, at-risk, and near-limit accounts.')
        global String tokenUsageSummary;
    }

    @InvocableMethod(
        label='Get Token Usage Summary'
        description='Returns account-level token consumption data. Categorizes accounts as: expansion candidates (good login rate, moderate usage — ready to buy more tokens), at-risk (low usage or low login rate — may churn), and near-limit (close to using all tokens — need renewal). Use this to answer questions about token health, upsell opportunities, and at-risk customers.'
    )
    global static List<ActionResult> getTokenUsage(List<ActionRequest> requests) {
        List<Map<String, Object>> expansion = new List<Map<String, Object>>();
        List<Map<String, Object>> atRisk = new List<Map<String, Object>>();
        List<Map<String, Object>> nearLimit = new List<Map<String, Object>>();
        List<Map<String, Object>> all = new List<Map<String, Object>>();

        for (TokenUsage__c tu : [
            SELECT Name, Account__r.Name, TokensUsed__c, TokenLimit__c, LoginPercentage__c, Period__c
            FROM TokenUsage__c
            ORDER BY TokensUsed__c DESC NULLS LAST
        ]) {
            Decimal usedPct = (tu.TokenLimit__c != null && tu.TokenLimit__c > 0 && tu.TokensUsed__c != null)
                ? (tu.TokensUsed__c / tu.TokenLimit__c * 100).setScale(1)
                : 0;
            Decimal loginPct = tu.LoginPercentage__c != null ? tu.LoginPercentage__c : 0;
            String accountName = tu.Account__r != null ? tu.Account__r.Name : tu.Name;

            Map<String, Object> row = new Map<String, Object>{
                'account'    => accountName,
                'tokensUsed' => tu.TokensUsed__c != null ? tu.TokensUsed__c.setScale(0) : 0,
                'tokenLimit' => tu.TokenLimit__c != null ? tu.TokenLimit__c.setScale(0) : 1000000,
                'usagePct'   => usedPct,
                'loginPct'   => loginPct,
                'period'     => tu.Period__c != null ? tu.Period__c : ''
            };
            all.add(row);

            if (usedPct >= 85) {
                nearLimit.add(row);
            } else if (loginPct >= 60 && usedPct >= 50 && usedPct < 85) {
                expansion.add(row);
            } else if (usedPct < 30 || loginPct < 40) {
                atRisk.add(row);
            }
        }

        Map<String, Object> summary = new Map<String, Object>{
            'expansionCandidates' => expansion,
            'atRisk'             => atRisk,
            'nearLimit'          => nearLimit,
            'allAccounts'        => all,
            'totalAccounts'      => all.size()
        };

        ActionResult res = new ActionResult();
        res.tokenUsageSummary = JSON.serialize(summary);
        return new List<ActionResult>{ res };
    }
}
