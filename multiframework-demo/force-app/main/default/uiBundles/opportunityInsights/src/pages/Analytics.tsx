import { useEffect, useState } from 'react';
import { Spinner } from '../components/ui/spinner';
import { AlertCircle } from 'lucide-react';
import { getAnalyticsSummary, AnalyticsSummary } from '../api/analyticsData';
import { RevenueCards } from '../components/analytics/RevenueCards';
import { PipelineCards } from '../components/analytics/PipelineCards';
import { ActivityCards } from '../components/analytics/ActivityCards';
import { QuoteCards } from '../components/analytics/QuoteCards';
import { ProductMetrics } from '../components/analytics/ProductMetrics';

export default function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b]">
      {/* Page header */}
      <div className="border-b border-[#252525]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#c9a96e] mb-3">
            Analytics Front-Page
          </p>
          <h1 className="text-[28px] font-semibold tracking-[-0.02em] text-[#f0ece6] leading-tight">
            Revenue & Activity Intelligence
          </h1>
          <p className="mt-2 text-[14px] text-[#6b6560] max-w-lg leading-relaxed">
            Real-time revenue, pipeline, activity, and product metrics from your Salesforce org.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center min-h-[320px] gap-3">
            <Spinner className="h-5 w-5 text-[#c9a96e]" />
            <p className="text-[13px] text-[#6b6560]">Loading analytics...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 flex items-start gap-3 max-w-2xl">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-red-400">{error}</p>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <RevenueCards
              month={data.revenue.month}
              quarter={data.revenue.quarter}
              year={data.revenue.year}
            />
            <PipelineCards
              month={data.pipeline.month}
              quarter={data.pipeline.quarter}
              year={data.pipeline.year}
            />
            <ActivityCards
              calls={data.activities.calls}
              emails={data.activities.emails}
              meetings={data.activities.meetings}
            />
            <QuoteCards
              draft={data.quotes.draft}
              awaitingApproval={data.quotes.awaitingApproval}
              awaitingSignature={data.quotes.awaitingSignature}
            />
            <ProductMetrics
              avgLoginPct={data.tokens.avgLoginPct}
              avgTokensUsed={data.tokens.avgTokensUsed}
              avgTokenLimit={data.tokens.avgTokenLimit}
              accounts={data.tokens.accounts}
              nearLimit={data.tokens.nearLimit}
              topContacts={data.tokens.topContacts}
            />
          </div>
        )}
      </div>
    </div>
  );
}
