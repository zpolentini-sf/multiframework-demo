import { useEffect, useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { OpportunityCard } from './OpportunityCard';
import { Spinner } from './ui/spinner';
import { AlertCircle } from 'lucide-react';

import OpportunitiesQuery from '../api/utils/query/opportunitiesQuery.graphql?raw';

interface Opportunity {
  Id: string;
  Name: { value: string };
  Amount: { value: number | null; displayValue: string | null };
  StageName: { value: string };
  CloseDate: { value: string };
  Probability: { value: number | null };
  Type: { value: string | null };
  Account?: {
    Id: string;
    Name: { value: string };
    Industry: { value: string | null };
  };
  Owner?: {
    Id: string;
    Name: { value: string };
  };
  NextStep?: { value: string | null };
  Description?: { value: string | null };
  OpportunityContactRoles?: {
    edges: Array<{
      node: {
        Contact: {
          Name: { value: string };
          Email: { value: string | null };
        };
      };
    }>;
  };
}

interface OpportunityListProps {
  onOpportunityClick?: (opportunity: Opportunity) => void;
}

export function OpportunityList({ onOpportunityClick }: OpportunityListProps) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOpportunities = async (after: string | null = null) => {
    try {
      after ? setLoadingMore(true) : setLoading(true);
      setError(null);

      const sdk = await createDataSDK();
      if (!sdk.graphql) throw new Error('GraphQL is not available in this context');

      const response = await sdk.graphql?.({ query: OpportunitiesQuery, variables: { first: 20, after } });

      if (response?.errors && response.errors.length > 0) throw new Error(response.errors[0].message);

      const edges = (response?.data as any)?.uiapi?.query?.Opportunity?.edges || [];
      const pageInfo = (response?.data as any)?.uiapi?.query?.Opportunity?.pageInfo;
      const fetched = edges.map((e: any) => e?.node).filter(Boolean);

      setOpportunities(prev => after ? [...prev, ...fetched] : fetched);
      setHasMore(pageInfo?.hasNextPage || false);
      setEndCursor(pageInfo?.endCursor || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load opportunities');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => { fetchOpportunities(); }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
        <Spinner className="h-5 w-5 text-[#c9a96e]" />
        <p className="text-[13px] text-[#6b6560]">Loading opportunities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 flex items-start gap-3 max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <p className="text-[13px] text-red-400">{error}</p>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[320px] gap-3 text-center">
        <p className="text-[15px] font-medium text-[#c8c2ba]">No open opportunities</p>
        <p className="text-[13px] text-[#6b6560] max-w-xs">Create your first opportunity to see pipeline intelligence here.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-[15px] font-medium text-[#f0ece6] tracking-[-0.01em]">Open Opportunities</h2>
          <p className="text-[12px] text-[#6b6560] mt-0.5">{opportunities.length} opportunities</p>
        </div>
      </div>

      {/* Vertical list */}
      <div className="flex flex-col pb-8">
        {opportunities.map((opp) => (
          <OpportunityCard
            key={opp.Id}
            opportunity={opp}
            onClick={() => onOpportunityClick?.(opp)}
            onUpdated={() => fetchOpportunities()}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pb-8">
          <button
            onClick={() => { if (hasMore && endCursor && !loadingMore) fetchOpportunities(endCursor); }}
            disabled={loadingMore}
            className="flex items-center gap-2 px-5 py-2 rounded border border-[#252525] text-[13px] text-[#c8c2ba] hover:border-[#333] hover:text-[#f0ece6] disabled:opacity-50 transition-colors"
          >
            {loadingMore ? <><Spinner className="h-3.5 w-3.5" /> Loading...</> : 'Load more'}
          </button>
        </div>
      )}
    </div>
  );
}
