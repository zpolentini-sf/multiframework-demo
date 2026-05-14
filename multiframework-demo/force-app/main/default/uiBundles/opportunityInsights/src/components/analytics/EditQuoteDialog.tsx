import { useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Spinner } from '../ui/spinner';

interface Quote {
  Id: string;
  Name: { value: string };
  Status: { value: string };
  ExpirationDate?: { value: string | null };
  Description?: { value: string | null };
}

interface EditQuoteDialogProps {
  quote: Quote;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const QUOTE_STATUSES = ['Draft', 'Needs Review', 'In Review', 'Approved', 'Presented', 'Rejected', 'Denied'];

export function EditQuoteDialog({ quote, open, onClose, onSaved }: EditQuoteDialogProps) {
  const [name, setName] = useState(quote.Name?.value ?? '');
  const [status, setStatus] = useState(quote.Status?.value ?? 'Draft');
  const [expirationDate, setExpirationDate] = useState(quote.ExpirationDate?.value?.split('T')[0] ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const sdk = await createDataSDK();
      const fields: Record<string, unknown> = { Name: name, Status: status };
      if (expirationDate) fields.ExpirationDate = expirationDate;

      const response = await sdk.fetch?.(
        `/services/data/v66.0/ui-api/records/${quote.Id}`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }
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
        <DialogHeader><DialogTitle>Edit Quote</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Quote Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Expiration Date</Label>
            <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
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
