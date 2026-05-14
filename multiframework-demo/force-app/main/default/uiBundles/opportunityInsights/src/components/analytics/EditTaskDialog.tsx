import { useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Spinner } from '../ui/spinner';

interface Task {
  Id: string;
  Subject: { value: string };
  Status: { value: string };
  ActivityDate?: { value: string };
  Description?: { value: string | null };
}

interface EditTaskDialogProps {
  task: Task;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred'];

export function EditTaskDialog({ task, open, onClose, onSaved }: EditTaskDialogProps) {
  const [subject, setSubject] = useState(task.Subject?.value ?? '');
  const [status, setStatus] = useState(task.Status?.value ?? 'Not Started');
  const [activityDate, setActivityDate] = useState(task.ActivityDate?.value?.split('T')[0] ?? '');
  const [description, setDescription] = useState(task.Description?.value ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const sdk = await createDataSDK();
      const fields: Record<string, unknown> = { Subject: subject, Status: status };
      if (activityDate) fields.ActivityDate = activityDate;
      if (description) fields.Description = description;

      const response = await sdk.fetch?.(
        `/services/data/v66.0/ui-api/records/${task.Id}`,
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
        <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes..." />
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
