import { useState } from 'react';
import { RecordDrawer, RecordRow } from './RecordDrawer';
import { createDataSDK } from '@salesforce/sdk-data';
import PipelineOppsQuery from '../../api/utils/query/pipelineOppsQuery.graphql?raw';

interface PipelineCardsProps {
  month: number;
  quarter: number;
  year: number;
}

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

const threshold = (n: number): { color: string; border: string; bg: string } => {
  if (n >= 2_000_000) return { color: '#4ade80', border: '#4ade80/30', bg: '#4ade80/5' };
  if (n >= 500_000)   return { color: '#facc15', border: '#facc15/30', bg: '#facc15/5' };
  return { color: '#f87171', border: '#f87171/30', bg: '#f87171/5' };
};

type Period = 'month' | 'quarter' | 'year';

const periodFilter: Record<Period, string> = {
  month: 'THIS_MONTH',
  quarter: 'THIS_QUARTER',
  year: 'THIS_YEAR',
};

export function PipelineCards({ month, quarter, year }: PipelineCardsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);

  const openDrawer = async (period: Period, label: string) => {
    setDrawerTitle(`Pipeline — ${label}`);
    setDrawerOpen(true);
    setLoading(true);
    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.({ query: PipelineOppsQuery, variables: { period: periodFilter[period] } });
      const edges = (res?.data as any)?.uiapi?.query?.Opportunity?.edges ?? [];
      setRecords(edges.map((e: any) => {
        const n = e?.node;
        const amt = n?.Amount?.displayValue ?? (n?.Amount?.value != null ? `$${n.Amount.value}` : '—');
        return {
          id: n?.Id ?? Math.random().toString(),
          primary: n?.Name?.value ?? 'Unknown',
          secondary: `${n?.StageName?.value ?? ''} · ${amt}`,
          tertiary: n?.CloseDate?.value ? `Closes ${n.CloseDate.value}` : undefined,
        };
      }));
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const cards: { label: string; value: number; period: Period }[] = [
    { label: 'This Month', value: month, period: 'month' },
    { label: 'This Quarter', value: quarter, period: 'quarter' },
    { label: 'This Year', value: year, period: 'year' },
  ];

  return (
    <>
      <div>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', margin: 0 }}>Pipeline Revenue</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {cards.map((c) => {
            const t = threshold(c.value);
            return (
              <div
                key={c.label}
                onClick={() => openDrawer(c.period, c.label)}
                style={{ background: '#141414', border: `1px solid #252525`, borderRadius: 6, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                className="hover:border-[#333] hover:bg-[#161616]"
              >
                <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                <p style={{ fontSize: 24, fontWeight: 600, color: t.color, margin: '0 0 8px', letterSpacing: '-0.02em' }}>{fmt(c.value)}</p>
                <div style={{ height: 3, background: '#252525', borderRadius: 2 }}>
                  <div style={{ height: '100%', borderRadius: 2, background: t.color, width: c.value > 0 ? `${Math.min((c.value / 5_000_000) * 100, 100)}%` : '0%', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        subtitle="Open opportunities closing this period"
        records={records}
        loading={loading}
      />
    </>
  );
}
