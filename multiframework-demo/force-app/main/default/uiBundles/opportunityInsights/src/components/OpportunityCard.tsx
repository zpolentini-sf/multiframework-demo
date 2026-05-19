import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { EditOpportunityDialog } from './EditOpportunityDialog';

interface Opportunity {
  Id: string;
  Name: { value: string };
  Amount: { value: number | null; displayValue: string | null };
  StageName: { value: string };
  CloseDate: { value: string };
  Probability: { value: number | null };
  Account?: {
    Name: { value: string };
    Industry: { value: string | null };
  };
  Owner?: {
    Name: { value: string };
  };
  NextStep?: { value: string | null };
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  onClick?: () => void;
  onUpdated?: () => void;
}

const stageStyle = (stage: string): string => {
  const s = stage.toLowerCase();
  if (s.includes('won')) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  if (s.includes('lost')) return 'text-red-400 bg-red-400/10 border-red-400/20';
  if (s.includes('negotiation')) return 'text-[#c9a96e] bg-[#c9a96e]/10 border-[#c9a96e]/20';
  if (s.includes('proposal') || s.includes('quote')) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
  if (s.includes('perception') || s.includes('analysis')) return 'text-violet-400 bg-violet-400/10 border-violet-400/20';
  return 'text-[#c8c2ba] bg-[#1e1e1e] border-[#252525]';
};

const formatCurrency = (amount: number | null, displayValue: string | null) => {
  if (displayValue) return displayValue;
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
};

const isOverdue = (dateStr: string | null | undefined) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

function ownerInitials(name: string): string {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export function OpportunityCard({ opportunity, onClick, onUpdated }: OpportunityCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const closeDate = opportunity.CloseDate?.value
    ? format(new Date(opportunity.CloseDate.value), 'MMM d')
    : '—';

  const overdue = isOverdue(opportunity.CloseDate?.value);
  const stage = opportunity.StageName?.value || 'Unknown';
  const prob = opportunity.Probability?.value;
  const ownerName = opportunity.Owner?.Name?.value;

  return (
    <>
      <div
        className="group relative flex items-center gap-4 py-4 border-b border-[#1a1a1a] hover:bg-[#0e0e0e] transition-colors cursor-pointer"
        onClick={onClick}
      >
        {/* Left: name + account + stage */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-[14px] font-medium text-[#f0ece6] leading-snug truncate">
              {opportunity.Name?.value || 'Untitled'}
            </h3>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {opportunity.Account && (
              <span className="text-[12px] text-[#6b6560] truncate max-w-[180px]">
                {opportunity.Account.Name?.value}
              </span>
            )}
            <span className={`inline-flex px-1.5 py-0.5 rounded border text-[10px] font-medium ${stageStyle(stage)}`}>
              {stage}
            </span>
          </div>

          {opportunity.NextStep?.value && (
            <p className="text-[12px] text-[#454040] mt-1.5 truncate leading-relaxed">
              {opportunity.NextStep.value}
            </p>
          )}
        </div>

        {/* Right: amount + prob + close */}
        <div className="flex items-center gap-5 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[#3a3530] uppercase tracking-wide mb-0.5">Prob.</p>
            <p className="text-[12px] text-[#6b6560]">{prob != null ? `${prob}%` : '—'}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-[#3a3530] uppercase tracking-wide mb-0.5">Close</p>
            <p className={`text-[12px] font-medium ${overdue ? 'text-red-400' : 'text-[#c8c2ba]'}`}>
              {closeDate}
              {overdue && <span className="ml-1 text-[9px] text-red-500/60">overdue</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#3a3530] uppercase tracking-wide mb-0.5">Amount</p>
            <p className="text-[13px] font-semibold text-[#c9a96e]">
              {formatCurrency(opportunity.Amount?.value ?? null, opportunity.Amount?.displayValue ?? null)}
            </p>
          </div>

          {/* Owner avatar */}
          {ownerName && (
            <div
              title={ownerName}
              className="w-7 h-7 rounded-full bg-[#1e1e1e] border border-[#252525] flex items-center justify-center shrink-0"
            >
              <span className="text-[10px] font-medium text-[#6b6560]">{ownerInitials(ownerName)}</span>
            </div>
          )}

          {/* Edit button */}
          <button
            onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
            className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-[#6b6560] hover:text-[#f0ece6] hover:bg-[#252525] transition-all shrink-0"
            aria-label="Edit opportunity"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
      </div>

      {editOpen && (
        <EditOpportunityDialog
          opportunity={opportunity}
          open={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={() => { onUpdated?.(); }}
        />
      )}
    </>
  );
}
