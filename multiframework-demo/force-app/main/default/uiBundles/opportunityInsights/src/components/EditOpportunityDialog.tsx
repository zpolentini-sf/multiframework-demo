import { useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Spinner } from './ui/spinner';

const STAGES = [
  'Prospecting',
  'Qualification',
  'Needs Analysis',
  'Value Proposition',
  'Id. Decision Makers',
  'Perception Analysis',
  'Proposal/Price Quote',
  'Negotiation/Review',
  'Closed Won',
  'Closed Lost',
];

interface EditOpportunityDialogProps {
  opportunity: {
    Id: string;
    Name: { value: string };
    Amount: { value: number | null };
    StageName: { value: string };
    CloseDate: { value: string };
    Probability: { value: number | null };
    NextStep?: { value: string | null };
  };
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditOpportunityDialog({ opportunity, open, onClose, onSaved }: EditOpportunityDialogProps) {
  const [name, setName] = useState(opportunity.Name?.value ?? '');
  const [amount, setAmount] = useState(String(opportunity.Amount?.value ?? ''));
  const [stage, setStage] = useState(opportunity.StageName?.value ?? '');
  const [closeDate, setCloseDate] = useState(opportunity.CloseDate?.value?.split('T')[0] ?? '');
  const [probability, setProbability] = useState(String(opportunity.Probability?.value ?? ''));
  const [nextStep, setNextStep] = useState(opportunity.NextStep?.value ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const sdk = await createDataSDK();
      const fields: Record<string, unknown> = {
        Name: name,
        StageName: stage,
        CloseDate: closeDate,
      };
      if (amount !== '') fields.Amount = parseFloat(amount);
      if (probability !== '') fields.Probability = parseFloat(probability);
      if (nextStep !== '') fields.NextStep = nextStep;

      const response = await sdk.fetch?.(
        `/services/data/v66.0/ui-api/records/${opportunity.Id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields }),
        }
      );

      if (!response) throw new Error('fetch not available');
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const msg = Array.isArray(body) ? body[0]?.message : body?.message;
        throw new Error(msg ?? `Save failed (${response.status})`);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Opportunity</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Amount</Label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Probability %</Label>
              <Input type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Stage</Label>
            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Close Date</Label>
            <Input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Next Step</Label>
            <Input value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="Next action..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <><Spinner className="h-4 w-4 mr-2" />Saving...</> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
