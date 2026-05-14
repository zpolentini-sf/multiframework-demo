import { createDataSDK } from '@salesforce/sdk-data';

export interface PipelineHealthInsight {
  summary: string;
  totalValue: string;
  dealCount: number;
  flags: { label: string; detail: string }[];
}

export interface NextStepIssue {
  dealName: string;
  amount: string;
  issue: string;
  suggested: string;
}

export interface OpportunityInsights {
  health: PipelineHealthInsight;
  nextSteps: NextStepIssue[];
}

export async function getOpportunityInsights(): Promise<OpportunityInsights> {
  const sdk = await createDataSDK();

  const response = await sdk.fetch?.('/services/apexrest/opportunity-summary/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response) throw new Error('fetch not available in this surface');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json as OpportunityInsights;
}
