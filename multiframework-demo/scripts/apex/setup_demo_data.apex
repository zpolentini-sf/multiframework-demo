// =============================================================================
// MULTIFRAMEWORK DEMO — Full Data Seed Script
// Run via: sf apex run --file scripts/apex/setup_demo_data.apex --target-org <alias>
//
// Creates: Accounts, Contacts, Opportunities, TokenUsage__c,
//          ContactTokenUsage__c, Project__c records, and assigns
//          the TokenUsageAccess permission set to the running user.
// Safe to re-run: existing records with the same Name are skipped.
// =============================================================================

// ── 1. Permission set assignment ─────────────────────────────────────────────
String psName = 'TokenUsageAccess';
Id userId = UserInfo.getUserId();
List<PermissionSet> psList = [SELECT Id FROM PermissionSet WHERE Name = :psName LIMIT 1];
if (!psList.isEmpty()) {
    List<PermissionSetAssignment> existing = [
        SELECT Id FROM PermissionSetAssignment
        WHERE PermissionSetId = :psList[0].Id AND AssigneeId = :userId
    ];
    if (existing.isEmpty()) {
        insert new PermissionSetAssignment(PermissionSetId = psList[0].Id, AssigneeId = userId);
        System.debug('Assigned ' + psName + ' to current user.');
    } else {
        System.debug(psName + ' already assigned to current user.');
    }
}

// ── 2. Accounts ───────────────────────────────────────────────────────────────
Map<String, Account> existingAccounts = new Map<String, Account>();
for (Account a : [SELECT Id, Name FROM Account WHERE Name IN (
    'Acme Corp','Datanet','Wellspring','Gamma Industries',
    'Permadyne','Advanced Comm','Tech Labs','Omega Systems'
)]) {
    existingAccounts.put(a.Name, a);
}

List<Account> accountsToInsert = new List<Account>();
for (String name : new List<String>{
    'Acme Corp','Datanet','Wellspring','Gamma Industries',
    'Permadyne','Advanced Comm','Tech Labs','Omega Systems'
}) {
    if (!existingAccounts.containsKey(name)) {
        accountsToInsert.add(new Account(
            Name = name,
            Industry = 'Technology',
            NumberOfEmployees = 500,
            AnnualRevenue = 50000000
        ));
    }
}
if (!accountsToInsert.isEmpty()) insert accountsToInsert;

// Rebuild full map after potential inserts
Map<String, Id> accountIdByName = new Map<String, Id>();
for (Account a : [SELECT Id, Name FROM Account WHERE Name IN (
    'Acme Corp','Datanet','Wellspring','Gamma Industries',
    'Permadyne','Advanced Comm','Tech Labs','Omega Systems'
)]) {
    accountIdByName.put(a.Name, a.Id);
}
System.debug('Accounts ready: ' + accountIdByName.keySet());

// ── 3. Contacts ───────────────────────────────────────────────────────────────
List<Map<String, String>> contactDefs = new List<Map<String, String>>{
    new Map<String, String>{'first'=>'Jordan',  'last'=>'Reeves',   'account'=>'Acme Corp'},
    new Map<String, String>{'first'=>'Morgan',  'last'=>'Haines',   'account'=>'Datanet'},
    new Map<String, String>{'first'=>'Casey',   'last'=>'Ortega',   'account'=>'Wellspring'},
    new Map<String, String>{'first'=>'Taylor',  'last'=>'Nguyen',   'account'=>'Gamma Industries'},
    new Map<String, String>{'first'=>'Riley',   'last'=>'Blackwell','account'=>'Permadyne'},
    new Map<String, String>{'first'=>'Avery',   'last'=>'Chen',     'account'=>'Advanced Comm'},
    new Map<String, String>{'first'=>'Cameron', 'last'=>'Walsh',    'account'=>'Tech Labs'},
    new Map<String, String>{'first'=>'Drew',    'last'=>'Mendoza',  'account'=>'Omega Systems'}
};

Map<String, Id> contactIdByLast = new Map<String, Id>();
for (Contact c : [SELECT Id, LastName FROM Contact WHERE LastName IN (
    'Reeves','Haines','Ortega','Nguyen','Blackwell','Chen','Walsh','Mendoza'
)]) {
    contactIdByLast.put(c.LastName, c.Id);
}

List<Contact> contactsToInsert = new List<Contact>();
for (Map<String, String> def : contactDefs) {
    if (!contactIdByLast.containsKey(def.get('last'))) {
        contactsToInsert.add(new Contact(
            FirstName = def.get('first'),
            LastName  = def.get('last'),
            AccountId = accountIdByName.get(def.get('account')),
            Email     = def.get('first').toLowerCase() + '.' + def.get('last').toLowerCase() + '@example.com',
            Title     = 'VP of Operations'
        ));
    }
}
if (!contactsToInsert.isEmpty()) insert contactsToInsert;

for (Contact c : [SELECT Id, LastName FROM Contact WHERE LastName IN (
    'Reeves','Haines','Ortega','Nguyen','Blackwell','Chen','Walsh','Mendoza'
)]) {
    contactIdByLast.put(c.LastName, c.Id);
}
System.debug('Contacts ready: ' + contactIdByLast.keySet());

// ── 4. Opportunities ──────────────────────────────────────────────────────────
List<Map<String, Object>> oppDefs = new List<Map<String, Object>>{
    new Map<String, Object>{'name'=>'Acme Corp — Platform Expansion',   'account'=>'Acme Corp',        'stage'=>'Proposal/Price Quote','amount'=>480000, 'daysOut'=>22},
    new Map<String, Object>{'name'=>'Datanet — Enterprise License',     'account'=>'Datanet',          'stage'=>'Negotiation/Review',  'amount'=>320000, 'daysOut'=>9},
    new Map<String, Object>{'name'=>'Wellspring — AI Pilot',            'account'=>'Wellspring',       'stage'=>'Value Proposition',   'amount'=>195000, 'daysOut'=>38},
    new Map<String, Object>{'name'=>'Gamma — Multi-Year Renewal',       'account'=>'Gamma Industries', 'stage'=>'Id. Decision Makers', 'amount'=>560000, 'daysOut'=>54},
    new Map<String, Object>{'name'=>'Permadyne — Agentforce Rollout',   'account'=>'Permadyne',        'stage'=>'Perception Analysis', 'amount'=>720000, 'daysOut'=>16},
    new Map<String, Object>{'name'=>'Advanced Comm — Upsell',           'account'=>'Advanced Comm',    'stage'=>'Proposal/Price Quote','amount'=>145000, 'daysOut'=>31},
    new Map<String, Object>{'name'=>'Tech Labs — Professional Services','account'=>'Tech Labs',        'stage'=>'Value Proposition',   'amount'=>88000,  'daysOut'=>45},
    new Map<String, Object>{'name'=>'Omega — Strategic Partnership',    'account'=>'Omega Systems',    'stage'=>'Needs Analysis',      'amount'=>990000, 'daysOut'=>67}
};

Set<String> existingOppNames = new Set<String>();
for (Opportunity o : [SELECT Name FROM Opportunity WHERE Name IN (
    'Acme Corp — Platform Expansion','Datanet — Enterprise License','Wellspring — AI Pilot',
    'Gamma — Multi-Year Renewal','Permadyne — Agentforce Rollout','Advanced Comm — Upsell',
    'Tech Labs — Professional Services','Omega — Strategic Partnership'
)]) {
    existingOppNames.add(o.Name);
}

List<Opportunity> oppsToInsert = new List<Opportunity>();
for (Map<String, Object> def : oppDefs) {
    String oppName = (String) def.get('name');
    if (!existingOppNames.contains(oppName)) {
        oppsToInsert.add(new Opportunity(
            Name        = oppName,
            AccountId   = accountIdByName.get((String) def.get('account')),
            StageName   = (String) def.get('stage'),
            Amount      = (Decimal) def.get('amount'),
            CloseDate   = Date.today().addDays((Integer) def.get('daysOut'))
        ));
    }
}
if (!oppsToInsert.isEmpty()) insert oppsToInsert;
System.debug('Opportunities ready. Inserted: ' + oppsToInsert.size());

// ── 5. TokenUsage__c ──────────────────────────────────────────────────────────
List<Map<String, Object>> tuDefs = new List<Map<String, Object>>{
    new Map<String, Object>{'name'=>'Acme Corp Usage',    'account'=>'Acme Corp',        'tokens'=>920000, 'limit'=>1000000, 'pct'=>78.5,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Datanet Usage',      'account'=>'Datanet',          'tokens'=>860000, 'limit'=>1000000, 'pct'=>82.3,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Wellspring Usage',   'account'=>'Wellspring',       'tokens'=>650000, 'limit'=>1000000, 'pct'=>61.0,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Gamma Usage',        'account'=>'Gamma Industries', 'tokens'=>480000, 'limit'=>1000000, 'pct'=>55.2,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Permadyne Usage',    'account'=>'Permadyne',        'tokens'=>970000, 'limit'=>1000000, 'pct'=>91.4,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Advanced Comm Usage','account'=>'Advanced Comm',    'tokens'=>730000, 'limit'=>1000000, 'pct'=>69.8,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Tech Labs Usage',    'account'=>'Tech Labs',        'tokens'=>890000, 'limit'=>1000000, 'pct'=>74.1,  'period'=>'May 2026'},
    new Map<String, Object>{'name'=>'Omega Usage',        'account'=>'Omega Systems',    'tokens'=>310000, 'limit'=>1000000, 'pct'=>42.6,  'period'=>'May 2026'}
};

Map<String, Id> tuIdByName = new Map<String, Id>();
for (TokenUsage__c tu : [SELECT Id, Name FROM TokenUsage__c WHERE Name IN (
    'Acme Corp Usage','Datanet Usage','Wellspring Usage','Gamma Usage',
    'Permadyne Usage','Advanced Comm Usage','Tech Labs Usage','Omega Usage'
)]) {
    tuIdByName.put(tu.Name, tu.Id);
}

List<TokenUsage__c> tuToInsert = new List<TokenUsage__c>();
for (Map<String, Object> def : tuDefs) {
    String tuName = (String) def.get('name');
    if (!tuIdByName.containsKey(tuName)) {
        tuToInsert.add(new TokenUsage__c(
            Name             = tuName,
            Account__c       = accountIdByName.get((String) def.get('account')),
            TokensUsed__c    = (Decimal) def.get('tokens'),
            TokenLimit__c    = (Decimal) def.get('limit'),
            LoginPercentage__c = (Decimal) def.get('pct'),
            Period__c        = (String) def.get('period')
        ));
    }
}
if (!tuToInsert.isEmpty()) insert tuToInsert;

for (TokenUsage__c tu : [SELECT Id, Name FROM TokenUsage__c WHERE Name IN (
    'Acme Corp Usage','Datanet Usage','Wellspring Usage','Gamma Usage',
    'Permadyne Usage','Advanced Comm Usage','Tech Labs Usage','Omega Usage'
)]) {
    tuIdByName.put(tu.Name, tu.Id);
}
System.debug('TokenUsage__c ready. Inserted: ' + tuToInsert.size());

// ── 6. ContactTokenUsage__c ───────────────────────────────────────────────────
List<Map<String, String>> ctuDefs = new List<Map<String, String>>{
    new Map<String, String>{'contact'=>'Reeves',   'tu'=>'Acme Corp Usage'},
    new Map<String, String>{'contact'=>'Haines',   'tu'=>'Datanet Usage'},
    new Map<String, String>{'contact'=>'Ortega',   'tu'=>'Wellspring Usage'},
    new Map<String, String>{'contact'=>'Nguyen',   'tu'=>'Gamma Usage'},
    new Map<String, String>{'contact'=>'Blackwell','tu'=>'Permadyne Usage'}
};

List<Id> ctuContactIds = new List<Id>();
for (Map<String, String> def : ctuDefs) {
    Id cId = contactIdByLast.get(def.get('contact'));
    if (cId != null) ctuContactIds.add(cId);
}

Set<Id> existingCtuContacts = new Set<Id>();
for (ContactTokenUsage__c ctu : [SELECT Contact__c FROM ContactTokenUsage__c WHERE Contact__c IN :ctuContactIds]) {
    existingCtuContacts.add(ctu.Contact__c);
}

List<ContactTokenUsage__c> ctuToInsert = new List<ContactTokenUsage__c>();
for (Map<String, String> def : ctuDefs) {
    Id cId = contactIdByLast.get(def.get('contact'));
    Id tId = tuIdByName.get(def.get('tu'));
    if (cId != null && tId != null && !existingCtuContacts.contains(cId)) {
        ctuToInsert.add(new ContactTokenUsage__c(
            Contact__c     = cId,
            TokenUsage__c  = tId,
            UsageAmount__c = (Decimal)(tuDefs[ctuDefs.indexOf(def)].get('tokens')) - 50000
        ));
    }
}
if (!ctuToInsert.isEmpty()) insert ctuToInsert;
System.debug('ContactTokenUsage__c ready. Inserted: ' + ctuToInsert.size());

// ── 7. Project__c ─────────────────────────────────────────────────────────────
List<Map<String, Object>> projDefs = new List<Map<String, Object>>{
    new Map<String, Object>{'name'=>'Acme AI Enablement',       'account'=>'Acme Corp',        'status'=>'On Track', 'pct'=>87, 'start'=>-45, 'due'=>30,  'desc'=>'Full Agentforce rollout across 3 sales teams, including custom prompt tuning and CRM integration.'},
    new Map<String, Object>{'name'=>'Datanet Platform Migration','account'=>'Datanet',          'status'=>'On Track', 'pct'=>62, 'start'=>-30, 'due'=>60,  'desc'=>'Migrating legacy CRM data to Salesforce and enabling Einstein analytics dashboards.'},
    new Map<String, Object>{'name'=>'Wellspring Agent Pilot',   'account'=>'Wellspring',       'status'=>'At Risk',  'pct'=>34, 'start'=>-60, 'due'=>14,  'desc'=>'Pilot deployment of conversational AI agent for support. Blocked on SSO configuration.'},
    new Map<String, Object>{'name'=>'Gamma Renewal Automation', 'account'=>'Gamma Industries', 'status'=>'Complete', 'pct'=>100,'start'=>-90, 'due'=>-5,  'desc'=>'Automated renewal workflows with AI-generated renewal briefs. Delivered ahead of schedule.'},
    new Map<String, Object>{'name'=>'Permadyne Scale-Up',       'account'=>'Permadyne',        'status'=>'On Track', 'pct'=>71, 'start'=>-20, 'due'=>45,  'desc'=>'Expanding Agentforce seat count from 50 to 200 users with training and change management.'},
    new Map<String, Object>{'name'=>'Advanced Comm Upsell Track','account'=>'Advanced Comm',   'status'=>'On Track', 'pct'=>55, 'start'=>-15, 'due'=>75,  'desc'=>'Structured success path to unlock add-on modules based on usage milestones.'}
};

Set<String> existingProjNames = new Set<String>();
for (Project__c p : [SELECT Name FROM Project__c WHERE Name IN (
    'Acme AI Enablement','Datanet Platform Migration','Wellspring Agent Pilot',
    'Gamma Renewal Automation','Permadyne Scale-Up','Advanced Comm Upsell Track'
)]) {
    existingProjNames.add(p.Name);
}

List<Project__c> projToInsert = new List<Project__c>();
for (Map<String, Object> def : projDefs) {
    String pName = (String) def.get('name');
    if (!existingProjNames.contains(pName)) {
        projToInsert.add(new Project__c(
            Name           = pName,
            Account__c     = accountIdByName.get((String) def.get('account')),
            Status__c      = (String) def.get('status'),
            CompletionPct__c = (Decimal) def.get('pct'),
            StartDate__c   = Date.today().addDays((Integer) def.get('start')),
            DueDate__c     = Date.today().addDays((Integer) def.get('due')),
            Description__c = (String) def.get('desc')
        ));
    }
}
if (!projToInsert.isEmpty()) insert projToInsert;
System.debug('Project__c ready. Inserted: ' + projToInsert.size());

System.debug('=== Demo data setup complete ===');
