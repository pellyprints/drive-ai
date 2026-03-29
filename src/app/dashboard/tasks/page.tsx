'use client';

import { useCallback, useEffect, useState } from 'react';

import { useRealtimeRefresh } from '../use-realtime';

interface Todo {
  created_at: string;
  description: string | null;
  due_date: string | null;
  id: string;
  priority: string;
  project_id: string | null;
  status: string;
  title: string;
}

const priorityColor: Record<string, string> = {
  high: '#f59e0b',
  low: '#6b7280',
  medium: '#3b82f6',
  urgent: '#ef4444',
};

export default function TasksPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState('all');
  const [newTitle, setNewTitle] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadTodos = useCallback(async () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    const res = await fetch(`/api/drive-ai/todos${params}`);
    if (res.ok) setTodos(await res.json());
  }, [filter]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  useRealtimeRefresh(loadTodos);

  const createTodo = async () => {
    if (!newTitle.trim()) return;
    await fetch('/api/drive-ai/todos', {
      body: JSON.stringify({ title: newTitle }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    setNewTitle('');
    setShowForm(false);
    loadTodos();
  };

  const toggleStatus = async (todo: Todo) => {
    const newStatus = todo.status === 'done' ? 'open' : 'done';
    await fetch(`/api/drive-ai/todos/${todo.id}`, {
      body: JSON.stringify({ status: newStatus }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });
    loadTodos();
  };

  return (
    <div>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Tasks</h1>
        <button
          style={{
            background: '#6366f1',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            padding: '8px 16px',
          }}
          onClick={() => setShowForm(true)}
        >
          + New Task
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'open', 'in_progress', 'done'].map((s) => (
          <button
            key={s}
            style={{
              background: filter === s ? '#334155' : '#1e293b',
              border: 'none',
              borderRadius: 6,
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: 13,
              padding: '6px 12px',
            }}
            onClick={() => setFilter(s)}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', borderRadius: 8, marginBottom: 16, padding: 16 }}>
          <input
            autoFocus
            placeholder="Task title..."
            value={newTitle}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              fontSize: 14,
              padding: '8px 12px',
              width: '100%',
            }}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTodo()}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                cursor: 'pointer',
                padding: '6px 16px',
              }}
              onClick={createTodo}
            >
              Create
            </button>
            <button
              style={{
                background: '#334155',
                border: 'none',
                borderRadius: 6,
                color: '#e2e8f0',
                cursor: 'pointer',
                padding: '6px 16px',
              }}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {todos.length === 0 && (
        <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
          No tasks yet. Create one to get started.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {todos.map((todo) => (
          <div
            key={todo.id}
            style={{
              alignItems: 'center',
              background: '#1e293b',
              borderRadius: 8,
              display: 'flex',
              gap: 12,
              opacity: todo.status === 'done' ? 0.6 : 1,
              padding: '12px 16px',
            }}
          >
            <input
              checked={todo.status === 'done'}
              style={{ cursor: 'pointer', height: 18, width: 18 }}
              type="checkbox"
              onChange={() => toggleStatus(todo)}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  textDecoration: todo.status === 'done' ? 'line-through' : 'none',
                }}
              >
                {todo.title}
              </div>
              {todo.due_date && (
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4 }}>
                  Due: {new Date(todo.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
            <span
              style={{
                background: priorityColor[todo.priority] || '#6b7280',
                borderRadius: 4,
                color: '#fff',
                fontSize: 11,
                padding: '2px 8px',
              }}
            >
              {todo.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
