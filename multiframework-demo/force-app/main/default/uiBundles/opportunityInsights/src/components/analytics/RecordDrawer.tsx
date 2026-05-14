import { X, Pencil, Plus } from 'lucide-react';

export interface RecordRow {
  id: string;
  primary: string;
  secondary?: string;
  tertiary?: string;
  onEdit?: () => void;
}

interface RecordDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  records: RecordRow[];
  loading?: boolean;
  onNew?: () => void;
}

export function RecordDrawer({ open, onClose, title, subtitle, records, loading, onNew }: RecordDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          width: 420,
          background: '#111',
          borderLeft: '1px solid #252525',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.2s ease',
          boxShadow: open ? '-16px 0 48px rgba(0,0,0,0.6)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #252525', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: '#f0ece6', margin: 0, lineHeight: 1.3 }}>{title}</h2>
              {subtitle && <p style={{ fontSize: 12, color: '#6b6560', margin: '4px 0 0', lineHeight: 1.4 }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              {onNew && (
                <button
                  onClick={(e) => { e.stopPropagation(); onNew(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#c9a96e', border: 'none', cursor: 'pointer', color: '#0b0b0b', padding: '5px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}
                >
                  <Plus size={13} />
                  New
                </button>
              )}
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b6560', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          </div>
          {!loading && (
            <p style={{ fontSize: 11, color: '#454040', margin: '8px 0 0' }}>{records.length} record{records.length !== 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Records list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b6560', fontSize: 13 }}>Loading records...</div>
          ) : records.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#6b6560', fontSize: 13 }}>No records found.</div>
          ) : (
            records.map((row) => (
              <div
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 20px',
                  borderBottom: '1px solid #1a1a1a',
                  gap: 12,
                  cursor: row.onEdit ? 'default' : 'default',
                }}
                className="group hover:bg-[#161616] transition-colors"
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#f0ece6', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.primary}
                  </p>
                  {row.secondary && (
                    <p style={{ fontSize: 11, color: '#6b6560', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.secondary}
                    </p>
                  )}
                  {row.tertiary && (
                    <p style={{ fontSize: 11, color: '#454040', margin: '1px 0 0' }}>{row.tertiary}</p>
                  )}
                </div>
                {row.onEdit && (
                  <button
                    onClick={row.onEdit}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#454040', padding: 6, borderRadius: 4, display: 'flex', alignItems: 'center', flexShrink: 0, opacity: 0 }}
                    className="group-hover:!opacity-100 hover:!text-[#f0ece6] hover:!bg-[#252525] transition-all"
                    aria-label="Edit record"
                  >
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
