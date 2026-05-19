import { createDataSDK } from '@salesforce/sdk-data';

export interface CustomerSuccessHighlight {
  id: string;
  name: string;
  account: string;
  status: string;
  completionPct: number;
  startDate: string;
  dueDate: string;
  health: 'strong' | 'on_track' | 'at_risk';
  headline: string;
  summary: string;
  actions: string[];
  tokensUsed: number;
  tokenLimit: number;
  queriesCompleted: number;
  hoursSaved: number;
  projectsOnTrack: number;
}

export async function getCustomerSuccessHighlights(): Promise<CustomerSuccessHighlight[]> {
  const sdk = await createDataSDK();

  const response = await sdk.fetch?.('/services/apexrest/customer-success/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!response) throw new Error('fetch not available in this surface');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);

  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json as CustomerSuccessHighlight[];
}
