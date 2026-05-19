import { useState } from 'react';
import { createDataSDK } from '@salesforce/sdk-data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Spinner } from '../ui/spinner';
import type { TaskNode } from './ActivityCards';

interface TaskDialogProps {
  task?: TaskNode;
  defaultType?: string;
  prefilledSubject?: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const TASK_STATUSES = ['Not Started', 'In Progress', 'Completed', 'Waiting on someone else', 'Deferred'];
const TASK_TYPES = ['Call', 'Email', 'Meeting'];

export function TaskDialog({ task, defaultType, prefilledSubject, open, onClose, onSaved }: TaskDialogProps) {
  const isEdit = !!task;
  const [subject, setSubject] = useState(task?.Subject?.value ?? prefilledSubject ?? '');
  const [status, setStatus] = useState(task?.Status?.value ?? 'Not Started');
  const [type, setType] = useState(task?.Type?.value ?? defaultType ?? 'Call');
  const [activityDate, setActivityDate] = useState(task?.ActivityDate?.value?.split('T')[0] ?? '');
  const [description, setDescription] = useState(task?.Description?.value ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!subject.trim()) { setError('Subject is required'); return; }
    setSaving(true);
    setError(null);
    try {
      const sdk = await createDataSDK();
      const fields: Record<string, unknown> = { Subject: subject, Status: status, Type: type };
      if (activityDate) fields.ActivityDate = activityDate;
      if (description) fields.Description = description;

      if (isEdit) {
        const response = await sdk.fetch?.(
          `/services/data/v66.0/ui-api/records/${task.Id}`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }) }
        );
        if (!response) throw new Error('fetch not available');
        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error((Array.isArray(body) ? body[0]?.message : body?.message) ?? `Save failed (${response.status})`);
        }
      } else {
        const response = await sdk.fetch?.(
          '/services/data/v66.0/ui-api/records/',
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ apiName: 'Task', fields }) }
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
        <DialogHeader><DialogTitle>{isEdit ? 'Edit Task' : 'New Task'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Task subject..." />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TASK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
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
            {saving ? <><Spinner className="h-4 w-4 mr-2" />Saving...</> : (isEdit ? 'Save' : 'Create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
