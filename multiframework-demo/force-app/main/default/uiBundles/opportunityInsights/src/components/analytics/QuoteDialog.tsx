import { useState, useEffect } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Spinner } from '../ui/spinner';
import type { QuoteNode } from './QuoteCards';

interface QuoteDialogProps {
  quote?: QuoteNode;
  defaultStatus?: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const QUOTE_STATUSES = ['Draft', 'Needs Review', 'In Review', 'Approved', 'Presented', 'Rejected', 'Denied'];

interface OppOption { id: string; name: string; }

export function QuoteDialog({ quote, defaultStatus, open, onClose, onSaved }: QuoteDialogProps) {
  const isEdit = !!quote;
  const [name, setName] = useState(quote?.Name?.value ?? '');
  const [status, setStatus] = useState(quote?.Status?.value ?? defaultStatus ?? 'Draft');
  const [expirationDate, setExpirationDate] = useState(quote?.ExpirationDate?.value?.split('T')[0] ?? '');
  const [oppId, setOppId] = useState('');
  const [opps, setOpps] = useState<OppOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit && open) {
      createDataSDK().then(sdk => {
        return sdk.fetch?.('/services/data/v66.0/query?q=SELECT+Id,Name+FROM+Opportunity+WHERE+IsClosed=false+ORDER+BY+Name+LIMIT+50');
      }).then(async res => {
        if (res?.ok) {
          const body = await res.json();
          setOpps((body.records ?? []).map((r: any) => ({ id: r.Id, name: r.Name })));
        }
      }).catch(() => {});
    }
  }, [isEdit, open]);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const sdk = await createDataSDK();
      const fields: Record<string, unknown> = { Name: name, Status: status };
      if (expirationDate) fields.ExpirationDate = expirationDate;

      if (isEdit) {
        const response = await sdk.fetch?.(
          `/services/data/v66.0/ui-api/records/${quote.Id}`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }
        );
        if (!response) throw new Error('fetch not available');
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((Array.isArray(body) ? body[0]?.message : body?.message) ?? `Save failed (${response.status})`);
        }
      } else {
        if (!oppId) { setError('Please select an opportunity'); setSaving(false); return; }
        fields.OpportunityId = oppId;
        const response = await sdk.fetch?.(
          '/services/data/v66.0/ui-api/records/',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiName: 'Quote', fields }) }
        );
        if (!response) throw new Error('fetch not available');
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((Array.isArray(body) ? body[0]?.message : body?.message) ?? `Create failed (${response.status})`);
        }
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
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Quote' : 'New Quote'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Quote Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Quote name..." />
          </div>
          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Opportunity</Label>
              <Select value={oppId} onValueChange={setOppId}>
                <SelectTrigger><SelectValue placeholder="Select an opportunity..." /></SelectTrigger>
                <SelectContent>
                  {opps.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
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
            {saving ? <><Spinner className="h-4 w-4 mr-2" />Saving...</> : (isEdit ? 'Save' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
