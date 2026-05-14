import { TokenAccountRow, TopContactRow } from '../../api/analyticsData';

interface ProductMetricsProps {
  avgLoginPct: number;
  avgTokensUsed: number;
  avgTokenLimit: number;
  accounts: TokenAccountRow[];
  nearLimit: TokenAccountRow[];
  topContacts: TopContactRow[];
}

const fmtTokens = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const usagePct = (used: number, limit: number) => limit > 0 ? Math.min(Math.round((used / limit) * 100), 100) : 0;

const pctColor = (pct: number) => {
  if (pct >= 90) return '#f87171';
  if (pct >= 70) return '#facc15';
  return '#4ade80';
};

export function ProductMetrics({ avgLoginPct, avgTokensUsed, avgTokenLimit, nearLimit, topContacts }: Omit<ProductMetricsProps, 'accounts'> & { accounts?: TokenAccountRow[] }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', margin: 0 }}>Product Usage</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

        {/* Login percentage */}
        <div style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Territory Login Rate</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: pctColor(avgLoginPct), letterSpacing: '-0.02em' }}>{avgLoginPct.toFixed(1)}%</span>
            <span style={{ fontSize: 12, color: '#6b6560' }}>of accounts</span>
          </div>
          <div style={{ height: 4, background: '#252525', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: pctColor(avgLoginPct), width: `${avgLoginPct}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Avg token usage */}
        <div style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Avg Token Usage / Account</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 24, fontWeight: 600, color: '#f0ece6', letterSpacing: '-0.02em' }}>{fmtTokens(avgTokensUsed)}</span>
            <span style={{ fontSize: 12, color: '#454040' }}>/ {fmtTokens(avgTokenLimit)}</span>
          </div>
          <div style={{ height: 4, background: '#252525', borderRadius: 2 }}>
            <div style={{ height: '100%', borderRadius: 2, background: pctColor(usagePct(avgTokensUsed, avgTokenLimit)), width: `${usagePct(avgTokensUsed, avgTokenLimit)}%`, transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Top contacts by usage */}
        <div style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top Contacts by Token Usage</p>
          {topContacts.length === 0 ? (
            <p style={{ fontSize: 12, color: '#454040' }}>No data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topContacts.map((c, i) => {
                const pct = usagePct(c.usageAmount, avgTokenLimit || 1_000_000);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontSize: 12, fontWeight: 500, color: '#f0ece6' }}>{c.contactName}</span>
                        {c.accountName && <span style={{ fontSize: 11, color: '#454040' }}> · {c.accountName}</span>}
                      </div>
                      <span style={{ fontSize: 11, color: '#6b6560' }}>{fmtTokens(c.usageAmount)}</span>
                    </div>
                    <div style={{ height: 3, background: '#252525', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: pctColor(pct), width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Accounts near limit */}
        <div style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px' }}>
          <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Accounts Near Token Limit
            <span style={{ marginLeft: 6, background: '#f87171/15', color: '#f87171', fontSize: 10, padding: '1px 6px', borderRadius: 3, border: '1px solid #f87171/20' }}>
              {nearLimit.length} at risk
            </span>
          </p>
          {nearLimit.length === 0 ? (
            <p style={{ fontSize: 12, color: '#454040' }}>No accounts near limit.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {nearLimit.slice(0, 5).map((a, i) => {
                const pct = usagePct(a.tokensUsed, a.tokenLimit);
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#f0ece6' }}>{a.accountName}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#f87171' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 3, background: '#252525', borderRadius: 2 }}>
                      <div style={{ height: '100%', borderRadius: 2, background: '#f87171', width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
