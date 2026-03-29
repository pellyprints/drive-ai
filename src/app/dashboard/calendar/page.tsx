'use client';

import { useCallback, useEffect, useState } from 'react';

interface Reminder {
  created_at: string;
  id: string;
  is_sent: boolean;
  recurrence_rule: string | null;
  remind_at: string;
  text: string;
}

interface Todo {
  due_date: string | null;
  id: string;
  status: string;
  title: string;
}

export default function CalendarPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [dueTodos, setDueTodos] = useState<Todo[]>([]);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);

  const checkUnlock = useCallback(async () => {
    try {
      const res = await fetch('/api/drive-ai/profile');
      if (!res.ok) return;
      const profile = await res.json();
      if (!profile.first_use_date) {
        setUnlocked(false);
        return;
      }
      const firstUse = new Date(profile.first_use_date);
      const today = new Date();
      firstUse.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      setUnlocked(today > firstUse);
    } catch {
      setUnlocked(false);
    }
  }, []);

  useEffect(() => {
    checkUnlock();
  }, [checkUnlock]);

  useEffect(() => {
    if (!unlocked) return;
    async function load() {
      try {
        const [rem, todos] = await Promise.all([
          fetch('/api/drive-ai/reminders?upcoming=true').then((r) => r.json()),
          fetch('/api/drive-ai/todos?sort_by=due_date&sort_order=asc').then((r) => r.json()),
        ]);
        if (Array.isArray(rem)) setReminders(rem);
        if (Array.isArray(todos)) setDueTodos(todos.filter((t: Todo) => t.due_date));
      } catch {
        // Not loaded
      }
    }
    load();
  }, [unlocked]);

  if (unlocked === null) return <div style={{ color: '#64748b', padding: 40 }}>Loading...</div>;

  if (!unlocked) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#64748b', fontSize: 48, marginBottom: 16 }}>&#x1F512;</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
          Calendar Unlocks Tomorrow
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>
          Use Drive AI for one day and your calendar features will unlock automatically.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Calendar</h1>

      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <h2
            style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12, textTransform: 'uppercase' }}
          >
            Upcoming Reminders
          </h2>
          {reminders.length === 0 && (
            <div style={{ color: '#64748b', fontSize: 14 }}>No upcoming reminders</div>
          )}
          {reminders.map((r) => (
            <div
              key={r.id}
              style={{
                background: '#1e293b',
                borderRadius: 8,
                marginBottom: 8,
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: 14 }}>{r.text}</div>
              <div style={{ color: '#818cf8', fontSize: 12, marginTop: 4 }}>
                {new Date(r.remind_at).toLocaleString()}
                {r.recurrence_rule && ` · Recurring`}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2
            style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12, textTransform: 'uppercase' }}
          >
            Tasks with Due Dates
          </h2>
          {dueTodos.length === 0 && (
            <div style={{ color: '#64748b', fontSize: 14 }}>No tasks with due dates</div>
          )}
          {dueTodos.map((t) => (
            <div
              key={t.id}
              style={{
                background: '#1e293b',
                borderRadius: 8,
                marginBottom: 8,
                opacity: t.status === 'done' ? 0.6 : 1,
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: 14 }}>{t.title}</div>
              <div style={{ color: '#f59e0b', fontSize: 12, marginTop: 4 }}>
                Due: {new Date(t.due_date!).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
