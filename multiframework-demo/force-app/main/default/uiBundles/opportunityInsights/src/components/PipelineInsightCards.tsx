import { useEffect, useState } from 'react';
import { Spinner } from './ui/spinner';
import { AlertCircle } from 'lucide-react';
import { getOpportunityInsights, OpportunityInsights } from '../api/opportunitySummary';

export function PipelineInsightCards() {
  const [insights, setInsights] = useState<OpportunityInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOpportunityInsights()
      .then((result) => { if (!cancelled) setInsights(result); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to generate insights'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-lg border border-[#252525] bg-[#141414] p-6 flex items-center gap-3">
            <Spinner className="h-3.5 w-3.5 text-[#c9a96e]" />
            <span className="text-[13px] text-[#6b6560]">Analyzing pipeline...</span>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-3 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
        <p className="text-[13px] text-red-400">{error}</p>
      </div>
    );
  }

  const health = insights?.health;
  const nextSteps = insights?.nextSteps?.slice(0, 5) ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

      {/* Pipeline Health */}
      <div className="rounded-lg border border-[#252525] bg-[#141414] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#252525]">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
            <span className="text-[13px] font-medium text-[#f0ece6] tracking-[-0.01em]">Pipeline Health</span>
          </div>
          {health && (
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-semibold text-[#f0ece6]">{health.totalValue}</span>
              <span className="text-[11px] text-[#6b6560]">{health.dealCount} deals</span>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {health?.summary ? (
            <p className="text-[13px] leading-[1.65] text-[#c8c2ba]">{health.summary}</p>
          ) : (
            <p className="text-[13px] text-[#6b6560]">No summary available.</p>
          )}

          {health?.flags && health.flags.length > 0 && (
            <div className="space-y-2 pt-1">
              {health.flags.map((flag, i) => (
                <div key={i} className="flex gap-3 rounded-md bg-[#1a1a1a] border border-[#252525] px-3.5 py-2.5">
                  <span className="shrink-0 mt-0.5 text-[11px] font-medium text-[#c9a96e] leading-tight whitespace-nowrap">
                    {flag.label}
                  </span>
                  <p className="text-[12px] text-[#6b6560] leading-relaxed">{flag.detail}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Outdated Next Steps */}
      <div className="rounded-lg border border-[#252525] bg-[#141414] overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#252525]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#c9a96e]" />
          <span className="text-[13px] font-medium text-[#f0ece6] tracking-[-0.01em]">Outdated Next Steps</span>
        </div>

        <div className="p-5">
          {nextSteps.length === 0 ? (
            <p className="text-[13px] text-[#6b6560]">No outdated next steps found.</p>
          ) : (
            <div className="space-y-3">
              {nextSteps.map((item, i) => (
                <div key={i} className="rounded-md bg-[#1a1a1a] border border-[#252525] px-3.5 py-3 space-y-2">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-[#f0ece6] truncate">{item.dealName}</span>
                    <span className="shrink-0 text-[12px] font-medium text-[#c9a96e]">{item.amount}</span>
                  </div>
                  <p className="text-[12px] leading-relaxed text-red-400/90">{item.issue}</p>
                  <div className="flex gap-2 items-start pt-0.5">
                    <span className="shrink-0 text-[10px] font-medium tracking-wide uppercase text-emerald-500/70 mt-0.5">Action</span>
                    <p className="text-[12px] leading-relaxed text-emerald-400/90">{item.suggested}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
