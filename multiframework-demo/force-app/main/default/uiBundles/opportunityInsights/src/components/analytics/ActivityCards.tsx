import { useState } from 'react';
import { Phone, Mail, Calendar } from 'lucide-react';
import { RecordDrawer, RecordRow } from './RecordDrawer';
import { TaskDialog } from './TaskDialog';
import { createDataSDK } from '@salesforce/sdk-data';
import TasksQuery from '../../api/utils/query/tasksQuery.graphql?raw';

interface ActivityCardsProps {
  calls: number;
  emails: number;
  meetings: number;
}

type ActivityType = 'Call' | 'Email' | 'Meeting';

export interface TaskNode {
  Id: string;
  Subject: { value: string };
  Status: { value: string };
  Type: { value: string };
  ActivityDate?: { value: string };
  Description?: { value: string | null };
}

export function ActivityCards({ calls, emails, meetings }: ActivityCardsProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [currentType, setCurrentType] = useState<ActivityType>('Call');
  const [records, setRecords] = useState<RecordRow[]>([]);
  const [, setTaskMap] = useState<Record<string, TaskNode>>({});
  const [loading, setLoading] = useState(false);
  const [editTask, setEditTask] = useState<TaskNode | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const loadRecords = async (type: ActivityType) => {
    setLoading(true);
    try {
      const sdk = await createDataSDK();
      const res = await sdk.graphql?.({ query: TasksQuery, variables: { taskType: type, first: 50 } });
      const edges = (res?.data as any)?.uiapi?.query?.Task?.edges ?? [];
      const map: Record<string, TaskNode> = {};
      const rows: RecordRow[] = edges.map((e: any) => {
        const n: TaskNode = e?.node;
        map[n.Id] = n;
        return {
          id: n.Id,
          primary: n.Subject?.value ?? 'Unknown',
          secondary: n.Status?.value,
          tertiary: n.ActivityDate?.value ? `Due ${n.ActivityDate.value}` : undefined,
          onEdit: () => setEditTask(n),
        };
      });
      setTaskMap(map);
      setRecords(rows);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (type: ActivityType, label: string) => {
    setCurrentType(type);
    setDrawerTitle(label + ' This Week');
    setDrawerOpen(true);
    loadRecords(type);
  };

  const cards = [
    { label: 'Calls', count: calls, icon: Phone, type: 'Call' as ActivityType, color: '#60a5fa' },
    { label: 'Emails', count: emails, icon: Mail, type: 'Email' as ActivityType, color: '#a78bfa' },
    { label: 'Meetings', count: meetings, icon: Calendar, type: 'Meeting' as ActivityType, color: '#34d399' },
  ];

  const handleSaved = () => {
    setEditTask(null);
    setCreateOpen(false);
    loadRecords(currentType);
  };

  return (
    <>
      <div>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#c9a96e', margin: 0 }}>Activity This Week</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {cards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.label}
                onClick={() => openDrawer(c.type, c.label)}
                style={{ background: '#141414', border: '1px solid #252525', borderRadius: 6, padding: '16px 18px', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s' }}
                className="hover:border-[#333] hover:bg-[#161616]"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, color: '#6b6560', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{c.label}</p>
                  <Icon size={13} color={c.color} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 600, color: '#f0ece6', margin: 0, letterSpacing: '-0.02em' }}>{c.count}</p>
                <p style={{ fontSize: 11, color: '#454040', margin: '4px 0 0' }}>Click to view records</p>
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

      {editTask && (
        <TaskDialog
          task={editTask}
          open={true}
          onClose={() => setEditTask(null)}
          onSaved={handleSaved}
        />
      )}

      {createOpen && (
        <TaskDialog
          defaultType={currentType}
          open={true}
          onClose={() => setCreateOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
