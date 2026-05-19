# Multiframework Demo — Deployment Guide

End-to-end instructions for deploying this app into a fresh Salesforce org.

---

## Prerequisites

- [Salesforce CLI](https://developer.salesforce.com/tools/salesforcecli) (`sf`) installed
- Org with **Einstein / Agentforce** enabled (Developer Edition, Sandbox, or Scratch org)
- Node.js 18+ (for UIBundle build)
- Authenticated org alias — replace `<alias>` throughout with your alias

Authenticate:
```bash
sf org login web --alias <alias>
```

---

## Step 1 — Update the Remote Site Setting

Before deploying, replace the placeholder URL in the remote site setting with your org's My Domain:

1. Find your org's My Domain URL: **Setup → My Domain**
2. Edit `force-app/main/default/remoteSiteSettings/OpportunityInsightsOrg.remoteSite-meta.xml`
3. Replace `https://YOUR-ORG-DOMAIN.my.salesforce.com` with your actual org URL

---

## Step 2 — Deploy Salesforce Metadata

```bash
sf project deploy start --source-dir force-app/main/default --target-org <alias>
```

This deploys all custom objects, Apex classes, flows, prompt templates, permission sets, bots, and agent configurations.

> **If you hit conflicts on existing metadata** (bots, standard value sets), deploy selectively:
> ```bash
> sf project deploy start \
>   --source-dir force-app/main/default/objects \
>   --source-dir force-app/main/default/classes \
>   --source-dir force-app/main/default/flows \
>   --source-dir force-app/main/default/permissionsets \
>   --source-dir force-app/main/default/remoteSiteSettings \
>   --source-dir force-app/main/default/genAiPromptTemplates \
>   --source-dir force-app/main/default/genAiPromptTemplateActivations \
>   --target-org <alias>
> ```

---

## Step 3 — Seed Demo Data

Run the data seed script to create Accounts, Contacts, Opportunities, TokenUsage__c, ContactTokenUsage__c, and Project__c records. It also assigns the `TokenUsageAccess` permission set to your user.

```bash
sf apex run --file scripts/apex/setup_demo_data.apex --target-org <alias>
```

This is idempotent — safe to run multiple times, existing records are skipped.

---

## Step 4 — Build and Deploy the UIBundle

```bash
cd force-app/main/default/uiBundles/opportunityInsights
npm install
npm run build
cd ../../../../..
sf project deploy start \
  --source-dir force-app/main/default/uiBundles/opportunityInsights \
  --target-org <alias>
```

---

## Step 5 — Update the Agentforce Chat Agent ID

The chat panel (`AgentforceChat.tsx`) has a hardcoded agent ID that points to the source org's Pipeline Customer Health Agent. After deploying to a new org:

1. Open **Setup → Agents** (or **Einstein → Agents**) in your org
2. Find the **Pipeline Customer Health Agent** and copy its Record ID (starts with `0Xx`)
3. Edit `force-app/main/default/uiBundles/opportunityInsights/src/components/AgentforceChat.tsx`
4. Replace the value of `AGENT_ID` on line 6 with your org's agent ID
5. Rebuild and redeploy the UIBundle (Step 4)

---

## Step 6 — Activate the Prompt Template

1. Go to **Setup → Prompt Builder**
2. Open **opportunityInsightsFreeform**
3. Click **Activate** if not already active

---

## Step 7 — Open the App

```bash
sf org open --target-org <alias>
```

Navigate to the **Opportunity Insights** app from the App Launcher.

---

## Included Demo Data

The seed script (`scripts/apex/setup_demo_data.apex`) creates:

| Object | Records |
|---|---|
| Account | 8 (Acme Corp, Datanet, Wellspring, Gamma Industries, Permadyne, Advanced Comm, Tech Labs, Omega Systems) |
| Contact | 8 (one per account) |
| Opportunity | 8 (varying stages, amounts, close dates) |
| TokenUsage__c | 8 (token consumption metrics per account) |
| ContactTokenUsage__c | 5 (contact-level usage records) |
| Project__c | 6 (mix of On Track, At Risk, Complete statuses) |

---

## Architecture Overview

```
force-app/main/default/
├── classes/                  # Apex REST controllers + invocable actions
│   ├── OpportunitySpotlightController.cls   # /services/apexrest/opportunity-spotlight/
│   ├── CustomerSuccessController.cls        # /services/apexrest/customer-success/
│   ├── GetCustomerSuccessDataAction.cls     # Flow-invocable: builds AI prompt + context
│   ├── GetOpenOpportunitiesAction.cls       # Agent action: fetches ranked opportunities
│   └── GetTokenUsageSummaryAction.cls       # Agent action: token health analysis
├── flows/
│   └── CustomerSuccessHighlightFlow.flow-meta.xml  # Data → AI prompt → response
├── genAiPromptTemplates/
│   └── opportunityInsightsFreeform          # Einstein GPT flex template
├── aiAuthoringBundles/
│   └── Pipeline_Customer_Health_Agent/      # Agent DSL definition
├── genAiPlannerBundles/
│   └── Pipeline_Customer_Health_Agent_v1/   # Agent planner + topic actions
├── objects/
│   ├── Project__c/           # Customer project tracking
│   ├── TokenUsage__c/        # AI token consumption per account
│   └── ContactTokenUsage__c/ # Contact-level token usage
├── permissionsets/
│   └── TokenUsageAccess      # Read/write access to all custom objects
└── uiBundles/opportunityInsights/           # React 19 + Vite 7 frontend
    └── src/
        ├── components/
        │   ├── OpportunitySpotlightCards.tsx   # AI deal health cards (left column)
        │   ├── CustomerSuccessCards.tsx        # Project health cards (right column)
        │   ├── AgentforceChat.tsx              # Embedded Agentforce chat panel
        │   └── ...
        └── api/
            ├── opportunitySpotlight.ts
            └── customerSuccessData.ts
```
