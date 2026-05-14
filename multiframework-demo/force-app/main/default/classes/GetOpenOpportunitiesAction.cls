global with sharing class GetOpenOpportunitiesAction {

    global class ActionRequest {
        @InvocableVariable(label='Input (unused)' description='Optional input; pass empty string.')
        global String input;
    }

    global class ActionResult {
        @InvocableVariable(label='Opportunities Summary' description='JSON string listing open opportunities ranked by priority.')
        global String opportunitiesSummary;
    }

    @InvocableMethod(
        label='Get Open Opportunities'
        description='Returns open opportunities ranked by priority: highest value, soonest close date, and most overdue first. Use this to tell the user which deals to focus on this week.'
    )
    global static List<ActionResult> getOpportunities(List<ActionRequest> requests) {
        List<Opportunity> opps = [
            SELECT Name, StageName, Amount, CloseDate, Probability,
                   NextStep, LastActivityDate, Account.Name
            FROM Opportunity
            WHERE IsClosed = false
            ORDER BY Amount DESC NULLS LAST
            LIMIT 20
        ];

        Date today = Date.today();
        List<Map<String, Object>> rows = new List<Map<String, Object>>();
        for (Opportunity o : opps) {
            Integer daysSinceActivity = o.LastActivityDate != null
                ? o.LastActivityDate.daysBetween(today)
                : 999;
            Boolean overdue = o.CloseDate != null && o.CloseDate < today;
            Integer daysUntilClose = o.CloseDate != null ? today.daysBetween(o.CloseDate) : null;

            rows.add(new Map<String, Object>{
                'name'              => o.Name,
                'account'          => o.Account != null ? o.Account.Name : '',
                'stage'            => o.StageName,
                'amount'           => o.Amount != null ? o.Amount.setScale(0) : 0,
                'closeDate'        => o.CloseDate != null ? String.valueOf(o.CloseDate) : 'N/A',
                'overdue'          => overdue,
                'daysUntilClose'   => daysUntilClose,
                'probability'      => o.Probability != null ? o.Probability.intValue() : 0,
                'nextStep'         => String.isBlank(o.NextStep) ? 'None recorded' : o.NextStep,
                'daysSinceActivity'=> daysSinceActivity
            });
        }

        ActionResult res = new ActionResult();
        res.opportunitiesSummary = JSON.serialize(rows);
        return new List<ActionResult>{ res };
    }
}
