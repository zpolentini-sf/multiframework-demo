interface RevenueCardsProps {
  month: number;
  quarter: number;
  year: number;
}

const fmt = (n: number) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
};

export function RevenueCards({ month, quarter, year }: RevenueCardsProps) {
  const cards = [
    { label: 'This Month', value: month },
    { label: 'This Quarter', value: quarter },
    { label: 'This Year', value: year },
  ];

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', margin: 0 }}>Revenue Closed</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px' }}>
            <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
            <p style={{ fontSize: 24, fontWeight: 600, color: '#c9a96e', margin: 0, letterSpacing: '-0.02em' }}>{fmt(c.value)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
