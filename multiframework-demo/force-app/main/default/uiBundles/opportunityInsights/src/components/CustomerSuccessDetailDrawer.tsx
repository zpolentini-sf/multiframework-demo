import { useState } from 'react';
import { X, AlertTriangle, TrendingUp, CheckCircle, ListTodo, ExternalLink, BarChart2 } from 'lucide-react';
import { CustomerSuccessHighlight } from '../api/customerSuccessData';
import { TaskDialog } from './analytics/TaskDialog';

interface Props {
  open: boolean;
  onClose: () => void;
  highlight: CustomerSuccessHighlight | null;
}

const healthConfig = {
  at_risk: { label: 'At Risk', color: '#f87171', bg: 'rgba(239,68,68,0.1)',    border: 'rgba(239,68,68,0.2)',    Icon: AlertTriangle },
  on_track: { label: 'On Track', color: '#c9a96e', bg: 'rgba(201,169,110,0.1)', border: 'rgba(201,169,110,0.2)', Icon: TrendingUp },
  strong:   { label: 'Strong',   color: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.18)', Icon: CheckCircle },
};

export function CustomerSuccessDetailDrawer({ open, onClose, highlight }: Props) {
  const [taskOpen, setTaskOpen] = useState(false);

  const cfg = highlight ? (healthConfig[highlight.health] ?? healthConfig.on_track) : healthConfig.on_track;
  const { Icon } = cfg;
  const taskSubject = highlight?.actions?.[0] ?? `Follow up on ${highlight?.name ?? 'project'}`;

  const openInSalesforce = () => {
    if (!highlight) return;
    window.open(`${window.location.origin}/lightning/r/Project__c/${highlight.id}/view`, '_blank', 'noopener');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 460, zIndex: 50,
          display: 'flex', flexDirection: 'column',
          background: '#0b0b0b',
          borderLeft: '1px solid #252525',
          boxShadow: open ? '-12px 0 48px rgba(0,0,0,0.7)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {!highlight ? null : (
          <>
            {/* Header */}
            <div style={{
              padding: '20px 24px 16px',
              borderBottom: '1px solid #1a1a1a',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, color: '#6b6560', margin: '0 0 4px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                    {highlight.account}
                  </p>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0ece6', margin: 0, lineHeight: 1.3, letterSpacing: '-0.015em' }}>
                    {highlight.name}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#34d399' }}>
                      {highlight.completionPct}% complete
                    </span>
                    <span style={{ fontSize: 11, color: '#3a3530' }}>·</span>
                    <span style={{ fontSize: 11, color: '#6b6560' }}>{highlight.status}</span>
                    {highlight.dueDate !== 'N/A' && (
                      <>
                        <span style={{ fontSize: 11, color: '#3a3530' }}>·</span>
                        <span style={{ fontSize: 11, color: '#6b6560' }}>Due {highlight.dueDate}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 28, height: 28, borderRadius: 6,
                    border: '1px solid #252525', background: 'none',
                    color: '#6b6560', cursor: 'pointer',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f0ece6'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#6b6560'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#252525'; }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Health badge */}
              <div style={{ marginTop: 12 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 20,
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  fontSize: 11, fontWeight: 600, color: cfg.color,
                }}>
                  <Icon size={11} strokeWidth={2} />
                  {cfg.label}
                </span>
              </div>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>

              {/* Headline */}
              <p style={{ fontSize: 14, fontWeight: 600, color: '#f0ece6', lineHeight: 1.45, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                {highlight.headline}
              </p>

              {/* Summary */}
              <p style={{ fontSize: 13, color: '#9b9590', lineHeight: 1.7, margin: '0 0 24px' }}>
                {highlight.summary}
              </p>

              {/* Metrics grid */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <BarChart2 size={13} color="#6b6560" />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6b6560' }}>
                    Key Metrics
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {/* Projects on track */}
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: '#111', border: '1px solid #1e1e1e', textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#c8c2ba', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                      {highlight.projectsOnTrack}
                    </p>
                    <p style={{ fontSize: 10, color: '#4a4540', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Active Projects
                    </p>
                  </div>
                  {/* Token consumption */}
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: '#111', border: '1px solid #1e1e1e', textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#34d399', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                      {Number(highlight.tokensUsed).toLocaleString()}
                    </p>
                    <p style={{ fontSize: 10, color: '#4a4540', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Tokens Used
                    </p>
                  </div>
                  {/* Hours saved */}
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: '#111', border: '1px solid #1e1e1e', textAlign: 'center' }}>
                    <p style={{ fontSize: 20, fontWeight: 700, color: '#34d399', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                      {Number(highlight.hoursSaved).toFixed(1)}
                    </p>
                    <p style={{ fontSize: 10, color: '#4a4540', margin: 0, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Hrs Saved
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested next steps */}
              {highlight.actions.length > 0 && (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <ListTodo size={13} color="#34d399" />
                    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#34d399' }}>
                      Suggested Next Steps
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {highlight.actions.map((action, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 14px', borderRadius: 8,
                        background: '#111', border: '1px solid #1e1e1e',
                      }}>
                        <span style={{
                          flexShrink: 0, width: 18, height: 18, borderRadius: '50%',
                          background: '#1e1e1e', border: '1px solid #2e2e2e',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 600, color: '#6b6560',
                        }}>
                          {i + 1}
                        </span>
                        <p style={{ fontSize: 13, color: '#c8c2ba', lineHeight: 1.5, margin: 0 }}>{action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Footer buttons */}
            <div style={{
              padding: '16px 24px 24px',
              borderTop: '1px solid #1a1a1a',
              display: 'flex', gap: 10, flexShrink: 0,
            }}>
              <button
                onClick={openInSalesforce}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 0', borderRadius: 8,
                  background: '#c9a96e', border: 'none',
                  color: '#0b0b0b', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              >
                <ExternalLink size={14} />
                Open in Salesforce
              </button>
              <button
                onClick={() => setTaskOpen(true)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  padding: '10px 0', borderRadius: 8,
                  background: '#161616', border: '1px solid #252525',
                  color: '#c8c2ba', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'border-color 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a'; (e.currentTarget as HTMLButtonElement).style.color = '#f0ece6'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#252525'; (e.currentTarget as HTMLButtonElement).style.color = '#c8c2ba'; }}
              >
                <ListTodo size={14} />
                Create Task
              </button>
            </div>
          </>
        )}
      </div>

      <TaskDialog
        open={taskOpen}
        defaultType="Call"
        onClose={() => setTaskOpen(false)}
        onSaved={() => setTaskOpen(false)}
        prefilledSubject={taskSubject}
      />
    </>
  );
}
