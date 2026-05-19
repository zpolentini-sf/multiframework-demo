import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getOpportunitySpotlights, OpportunitySpotlight } from '../api/opportunitySpotlight';

interface Props {
  onSelect: (spotlight: OpportunitySpotlight) => void;
}

// Inline SVG illustrations — 5 distinct chart types, colored per health config

function IllustrationLineArea({ color }: { color: string }) {
  const id = `la-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 160 120" fill="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d="M16 72 C36 68 52 52 72 48 C92 44 100 58 128 38 L128 108 L16 108 Z" fill={`url(#${id})`} />
      <path d="M16 72 C36 68 52 52 72 48 C92 44 100 58 128 38" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="72" r="3" fill={color} opacity="0.6" />
      <circle cx="72" cy="48" r="3" fill={color} opacity="0.7" />
      <circle cx="128" cy="38" r="4" fill={color} />
      <path d="M124 30 L128 24 L132 30" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
    </svg>
  );
}

function IllustrationBars({ color }: { color: string }) {
  const ids = ['b1', 'b2', 'b3', 'b4'].map(s => `bar-${color.replace('#', '')}-${s}`);
  const opacities = [0.5, 0.35, 0.25, 0.15];
  return (
    <svg viewBox="0 0 160 120" fill="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        {ids.map((id, i) => (
          <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={opacities[i]} />
            <stop offset="100%" stopColor={color} stopOpacity={opacities[i] * 0.2} />
          </linearGradient>
        ))}
      </defs>
      <rect x="16" y="78" width="20" height="30" rx="3" fill={`url(#${ids[3]})`} stroke={color} strokeOpacity="0.2" strokeWidth="1" />
      <rect x="44" y="62" width="20" height="46" rx="3" fill={`url(#${ids[2]})`} stroke={color} strokeOpacity="0.25" strokeWidth="1" />
      <rect x="72" y="44" width="20" height="64" rx="3" fill={`url(#${ids[1]})`} stroke={color} strokeOpacity="0.3" strokeWidth="1" />
      <rect x="100" y="26" width="20" height="82" rx="3" fill={`url(#${ids[0]})`} stroke={color} strokeOpacity="0.4" strokeWidth="1" />
      <line x1="14" y1="110" x2="124" y2="110" stroke={color} strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  );
}

function IllustrationScatter({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 120" fill="none" style={{ width: '100%', height: '100%' }}>
      <line x1="16" y1="104" x2="144" y2="104" stroke={color} strokeOpacity="0.15" strokeWidth="1" />
      <line x1="16" y1="104" x2="16" y2="20" stroke={color} strokeOpacity="0.15" strokeWidth="1" />
      <line x1="20" y1="96" x2="136" y2="32" stroke={color} strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="28" cy="90" r="4" fill={color} opacity="0.3" />
      <circle cx="44" cy="78" r="5" fill={color} opacity="0.35" />
      <circle cx="60" cy="82" r="3" fill={color} opacity="0.3" />
      <circle cx="76" cy="64" r="6" fill={color} opacity="0.4" />
      <circle cx="90" cy="56" r="4" fill={color} opacity="0.45" />
      <circle cx="104" cy="48" r="5" fill={color} opacity="0.5" />
      <circle cx="118" cy="38" r="3.5" fill={color} opacity="0.55" />
      <circle cx="130" cy="30" r="6" fill={color} opacity="0.65" />
    </svg>
  );
}

function IllustrationDonut({ color }: { color: string }) {
  const r = 32;
  const cx = 80, cy = 62;
  const circumference = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 160 120" fill="none" style={{ width: '100%', height: '100%' }}>
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeOpacity="0.1" strokeWidth="12" fill="none" />
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeOpacity="0.55" strokeWidth="12" fill="none"
        strokeDasharray={`${circumference * 0.72} ${circumference * 0.28}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
      />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={color} opacity="0.75">72%</text>
      <circle cx={cx} cy={cy} r={r - 19} stroke={color} strokeOpacity="0.12" strokeWidth="1" fill="none" />
    </svg>
  );
}

function IllustrationWave({ color }: { color: string }) {
  const id = `wv-${color.replace('#', '')}`;
  return (
    <svg viewBox="0 0 160 120" fill="none" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d="M16 80 C30 72 38 56 52 54 C66 52 74 68 88 66 C102 64 110 48 128 40 L128 108 L16 108 Z" fill={`url(#${id})`} />
      <path d="M16 80 C30 72 38 56 52 54 C66 52 74 68 88 66 C102 64 110 48 128 40" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="52" cy="54" r="3" fill={color} opacity="0.6" />
      <circle cx="88" cy="66" r="3" fill={color} opacity="0.6" />
      <circle cx="128" cy="40" r="4" fill={color} />
      <line x1="16" y1="108" x2="128" y2="108" stroke={color} strokeOpacity="0.12" strokeWidth="1" />
    </svg>
  );
}

type IllustrationComponent = React.ComponentType<{ color: string }>;

const ILLUSTRATIONS: IllustrationComponent[] = [
  IllustrationLineArea,
  IllustrationBars,
  IllustrationScatter,
  IllustrationDonut,
  IllustrationWave,
];

const healthConfig = {
  at_risk: {
    label: 'At Risk',
    color: '#f87171',
    bgFrom: 'rgba(239,68,68,0.14)',
    bgTo: 'rgba(239,68,68,0.04)',
    border: 'rgba(239,68,68,0.18)',
    badgeBg: 'rgba(239,68,68,0.12)',
    badgeBorder: 'rgba(239,68,68,0.22)',
  },
  on_track: {
    label: 'On Track',
    color: '#c9a96e',
    bgFrom: 'rgba(201,169,110,0.14)',
    bgTo: 'rgba(201,169,110,0.04)',
    border: 'rgba(201,169,110,0.18)',
    badgeBg: 'rgba(201,169,110,0.12)',
    badgeBorder: 'rgba(201,169,110,0.22)',
  },
  strong: {
    label: 'Strong',
    color: '#34d399',
    bgFrom: 'rgba(52,211,153,0.12)',
    bgTo: 'rgba(52,211,153,0.03)',
    border: 'rgba(52,211,153,0.16)',
    badgeBg: 'rgba(52,211,153,0.1)',
    badgeBorder: 'rgba(52,211,153,0.2)',
  },
};

function SkeletonCard() {
  return (
    <div style={{
      display: 'flex', borderRadius: 12,
      border: '1px solid #1e1e1e', background: '#0f0f0f',
      overflow: 'hidden', marginBottom: 28, minHeight: 160,
    }}>
      <div style={{ width: 200, flexShrink: 0, background: '#141414' }} />
      <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ height: 10, width: 140, background: '#1a1a1a', borderRadius: 4 }} />
        <div style={{ height: 18, width: '70%', background: '#1e1e1e', borderRadius: 4 }} />
        <div style={{ height: 14, width: '55%', background: '#1e1e1e', borderRadius: 4 }} />
        <div style={{ height: 12, width: '90%', background: '#161616', borderRadius: 4, marginTop: 4 }} />
        <div style={{ height: 12, width: '75%', background: '#161616', borderRadius: 4 }} />
        <div style={{ height: 10, width: 180, background: '#1a1a1a', borderRadius: 4, marginTop: 6 }} />
      </div>
    </div>
  );
}

export function OpportunitySpotlightCards({ onSelect }: Props) {
  const [spotlights, setSpotlights] = useState<OpportunitySpotlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getOpportunitySpotlights()
      .then((data) => { if (!cancelled) setSpotlights(data); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load spotlights'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();

  return (
    <div style={{ marginBottom: 48 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', boxShadow: '0 0 6px #c9a96e88', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e' }}>
            Intelligence Briefing
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#454040', letterSpacing: '0.06em' }}>{today}</span>
      </div>

      {loading ? (
        <div>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <div style={{ padding: '16px 0', fontSize: 13, color: '#6b6560' }}>{error}</div>
      ) : spotlights.length === 0 ? (
        <div style={{ padding: '16px 0', fontSize: 13, color: '#6b6560' }}>No opportunities to spotlight.</div>
      ) : (
        <div>
          {spotlights.map((s, idx) => {
            const cfg = healthConfig[s.health] ?? healthConfig.on_track;
            const Illustration = ILLUSTRATIONS[idx % ILLUSTRATIONS.length];
            const issueNum = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  borderRadius: 12,
                  border: `1px solid #1e1e1e`,
                  background: '#0f0f0f',
                  overflow: 'hidden',
                  marginBottom: 28,
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onClick={() => onSelect(s)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#2e2e2e';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#1e1e1e';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 200,
                  flexShrink: 0,
                  background: `linear-gradient(160deg, ${cfg.bgFrom}, ${cfg.bgTo})`,
                  borderRight: `1px solid ${cfg.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px 16px',
                }}>
                  <Illustration color={cfg.color} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, padding: '22px 28px', display: 'flex', flexDirection: 'column' }}>
                  {/* Meta row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, letterSpacing: '0.06em' }}>
                      № {issueNum}
                    </span>
                    <span style={{ fontSize: 11, color: '#2e2e2e' }}>·</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6560', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {s.stage}
                    </span>
                    <span style={{ fontSize: 11, color: '#2e2e2e' }}>·</span>
                    <span style={{ fontSize: 11, color: '#454040', letterSpacing: '0.04em' }}>
                      CLOSES {s.closeDate.toUpperCase()}
                    </span>
                    <span style={{
                      marginLeft: 2, fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                      color: cfg.color, background: cfg.badgeBg,
                      border: `1px solid ${cfg.badgeBorder}`,
                      padding: '1px 6px', borderRadius: 10, textTransform: 'uppercase',
                    }}>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Headline */}
                  <h3 style={{
                    fontSize: 20, fontWeight: 700, color: '#f0ece6',
                    lineHeight: 1.3, letterSpacing: '-0.02em',
                    margin: '0 0 10px',
                  }}>
                    {s.headline}
                  </h3>

                  {/* Summary */}
                  <p style={{
                    fontSize: 13, color: '#7a736c', lineHeight: 1.7,
                    margin: '0 0 14px', flex: 1,
                    display: '-webkit-box', WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {s.summary}
                  </p>

                  {/* Stats + CTA row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#c9a96e' }}>{s.amount}</span>
                      <span style={{ fontSize: 11, color: '#2e2e2e' }}>·</span>
                      <span style={{ fontSize: 12, color: '#6b6560' }}>{s.account}</span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 8,
                      border: '1px solid #252525', background: '#161616',
                      fontSize: 12, fontWeight: 600, color: '#c8c2ba',
                      flexShrink: 0,
                      transition: 'border-color 0.12s, color 0.12s',
                    }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#3a3a3a';
                        (e.currentTarget as HTMLDivElement).style.color = '#f0ece6';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.borderColor = '#252525';
                        (e.currentTarget as HTMLDivElement).style.color = '#c8c2ba';
                      }}
                    >
                      View Details
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
