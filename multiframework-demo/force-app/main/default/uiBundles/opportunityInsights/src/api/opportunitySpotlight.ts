import { createDataSDK } from '@salesforce/sdk-data';

export interface OpportunitySpotlight {
  id: string;
  name: string;
  account: string;
  amount: string;
  stage: string;
  closeDate: string;
  headline: string;
  summary: string;
  health: 'at_risk' | 'on_track' | 'strong';
  actions: string[];
}

export async function getOpportunitySpotlights(): Promise<OpportunitySpotlight[]> {
  const sdk = await createDataSDK();

  const response = await sdk.fetch?.('/services/apexrest/opportunity-spotlight/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response) throw new Error('fetch not available in this surface');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json as OpportunitySpotlight[];
}
