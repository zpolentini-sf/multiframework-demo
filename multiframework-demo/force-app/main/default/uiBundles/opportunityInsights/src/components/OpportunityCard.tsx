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

export function OpportunityCard({ opportunity, onClick, onUpdated }: OpportunityCardProps) {
  const [editOpen, setEditOpen] = useState(false);

  const closeDate = opportunity.CloseDate?.value
    ? format(new Date(opportunity.CloseDate.value), 'MMM d, yyyy')
    : '—';

  const overdue = isOverdue(opportunity.CloseDate?.value);
  const stage = opportunity.StageName?.value || 'Unknown';
  const prob = opportunity.Probability?.value;

  return (
    <>
      <div className="group relative rounded-lg border border-[#252525] bg-[#141414] hover:border-[#333] hover:bg-[#161616] transition-all duration-150 cursor-pointer overflow-hidden"
        onClick={onClick}
      >
        {/* Edit button */}
        <button
          onClick={(e) => { e.stopPropagation(); setEditOpen(true); }}
          className="absolute top-3 right-3 p-1.5 rounded opacity-0 group-hover:opacity-100 text-[#6b6560] hover:text-[#f0ece6] hover:bg-[#252525] transition-all"
          aria-label="Edit opportunity"
        >
          <Pencil className="h-3 w-3" />
        </button>

        <div className="px-4 pt-4 pb-3">
          {/* Name + account */}
          <h3 className="text-[14px] font-medium text-[#f0ece6] leading-snug pr-6 truncate">
            {opportunity.Name?.value || 'Untitled'}
          </h3>
          {opportunity.Account && (
            <p className="mt-0.5 text-[12px] text-[#6b6560] truncate">
              {opportunity.Account.Name?.value}
              {opportunity.Account.Industry?.value && (
                <span className="text-[#454040]"> · {opportunity.Account.Industry.value}</span>
              )}
            </p>
          )}

          {/* Stage badge */}
          <span className={`inline-flex mt-2 px-2 py-0.5 rounded border text-[11px] font-medium ${stageStyle(stage)}`}>
            {stage}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-[#1e1e1e] mx-4" />

        <div className="px-4 py-3 grid grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-[#454040] uppercase tracking-wide mb-0.5">Amount</p>
            <p className="text-[13px] font-semibold text-[#c9a96e]">
              {formatCurrency(opportunity.Amount?.value ?? null, opportunity.Amount?.displayValue ?? null)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#454040] uppercase tracking-wide mb-0.5">Prob.</p>
            <p className="text-[13px] font-medium text-[#c8c2ba]">
              {prob != null ? `${prob}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#454040] uppercase tracking-wide mb-0.5">Close</p>
            <p className={`text-[12px] font-medium ${overdue ? 'text-red-400' : 'text-[#c8c2ba]'}`}>
              {closeDate}
              {overdue && <span className="ml-1 text-[10px] text-red-500/70">overdue</span>}
            </p>
          </div>
        </div>

        {opportunity.NextStep?.value && (
          <>
            <div className="border-t border-[#1e1e1e] mx-4" />
            <div className="px-4 py-3">
              <p className="text-[10px] text-[#454040] uppercase tracking-wide mb-1">Next Step</p>
              <p className="text-[12px] text-[#6b6560] line-clamp-2 leading-relaxed">{opportunity.NextStep.value}</p>
            </div>
          </>
        )}

        {opportunity.Owner && (
          <div className="px-4 pb-3">
            <p className="text-[11px] text-[#454040] truncate">
              {opportunity.Owner.Name?.value}
            </p>
          </div>
        )}
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
