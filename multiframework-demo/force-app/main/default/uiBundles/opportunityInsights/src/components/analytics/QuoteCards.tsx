import { useState } from 'react';
import { FileText, Clock, CheckCircle } from 'lucide-react';
import { RecordDrawer, RecordRow } from './RecordDrawer';
import { QuoteDialog } from './QuoteDialog';
import { createDataSDK } from '@salesforce/sdk-data';
import QuotesQuery from '../../api/utils/query/quotesQuery.graphql?raw';

interface QuoteCardsProps {
  draft: number;
  awaitingApproval: number;
  awaitingSignature: number;
}

export interface QuoteNode {
  Id: string;
  Name: { value: string };
  Status: { value: string };
  GrandTotal?: { value: number | null; displayValue: string | null };
  ExpirationDate?: { value: string | null };
  Opportunity?: { Name: { value: string } };
}

type QuoteStatus = 'Draft' | 'In Review' | 'Presented';

export function QuoteCards({ draft, awaitingApproval, awaitingSignature }: QuoteCardsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [currentStatus, setCurrentStatus] = useState<QuoteStatus>('Draft');
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editQuote, setEditQuote] = useState<QuoteNode | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadRecords = async (status: QuoteStatus) => {
    setLoading(true);
    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.({ query: QuotesQuery, variables: { status, first: 50 } });
      const edges = (res?.data as any)?.uiapi?.query?.Quote?.edges ?? [];
      const rows: RecordRow[] = edges.map((e: any) => {
        const n: QuoteNode = e?.node;
        const amt = n.GrandTotal?.displayValue ?? (n.GrandTotal?.value != null ? `$${n.GrandTotal.value}` : '—');
        return {
          id: n.Id,
          primary: n.Name?.value ?? 'Unknown Quote',
          secondary: [n.Opportunity?.Name?.value, amt].filter(Boolean).join(' · '),
          tertiary: n.ExpirationDate?.value ? `Expires ${n.ExpirationDate.value}` : undefined,
          onEdit: () => setEditQuote(n),
        };
      });
      setRecords(rows);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (status: QuoteStatus, label: string) => {
    setCurrentStatus(status);
    setDrawerTitle(label);
    setDrawerOpen(true);
    loadRecords(status);
  };

  const cards = [
    { label: 'Draft', count: draft, icon: FileText, status: 'Draft' as QuoteStatus, color: '#94a3b8' },
    { label: 'Awaiting Approval', count: awaitingApproval, icon: Clock, status: 'In Review' as QuoteStatus, color: '#facc15' },
    { label: 'Awaiting Signature', count: awaitingSignature, icon: CheckCircle, status: 'Presented' as QuoteStatus, color: '#4ade80' },
  ];

  const handleSaved = () => {
    setEditQuote(null);
    setCreateOpen(false);
    loadRecords(currentStatus);
  };

  return (
    <>
      <div>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', margin: 0 }}>Quote Pipeline</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                onClick={() => openDrawer(c.status, c.label + ' Quotes')}
                style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                className="hover:border-[#333] hover:bg-[#161616]"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: '#6b6560', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                  <Icon size={13} color={c.color} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 600, color: '#f0ece6', margin: 0, letterSpacing: '-0.02em' }}>{c.count}</p>
                <p style={{ fontSize: 11, color: '#454040', margin: '4px 0 0' }}>Click to view quotes</p>
              </div>
            );
          })}
        </div>
      </div>

      <RecordDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={drawerTitle}
        records={records}
        loading={loading}
        onNew={() => setCreateOpen(true)}
      />

      {editQuote && (
        <QuoteDialog
          quote={editQuote}
          open={true}
          onClose={() => setEditQuote(null)}
          onSaved={handleSaved}
        />
      )}

      {createOpen && (
        <QuoteDialog
          defaultStatus={currentStatus}
          open={true}
          onClose={() => setCreateOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
