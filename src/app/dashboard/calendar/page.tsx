'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
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
  }, []);

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
