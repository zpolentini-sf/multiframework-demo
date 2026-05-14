import { createDataSDK } from '@salesforce/sdk-data';

export interface AnalyticsSummary {
  revenue: { month: number; quarter: number; year: number };
  pipeline: { month: number; quarter: number; year: number };
  activities: { calls: number; emails: number; meetings: number };
  quotes: { draft: number; awaitingApproval: number; awaitingSignature: number };
  tokens: {
    avgLoginPct: number;
    avgTokensUsed: number;
    avgTokenLimit: number;
    accounts: TokenAccountRow[];
    nearLimit: TokenAccountRow[];
    topContacts: TopContactRow[];
  };
}

export interface TokenAccountRow {
  id: string;
  accountName: string;
  tokensUsed: number;
  tokenLimit: number;
  loginPct: number;
}

export interface TopContactRow {
  contactName: string;
  accountName: string;
  usageAmount: number;
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const sdk = await createDataSDK();
  const response = await sdk.fetch?.('/services/apexrest/analytics-summary/', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response) throw new Error('fetch not available in this surface');
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(json.error);
  return json as AnalyticsSummary;
}
