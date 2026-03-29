'use client';

import { useCallback, useEffect, useState } from 'react';

interface Memory {
  category: string;
  content: string;
  created_at: string;
  id: string;
  is_starred: boolean;
  memory_type: string;
}

const categories = [
  'All',
  'General',
  'Business Ideas',
  'Decisions',
  'People',
  'Personal',
  'To-Dos',
];

export default function MemoryPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadMemories = useCallback(async () => {
    const params = category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/drive-ai/memories${params}`);
    if (res.ok) setMemories(await res.json());
  }, [category]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadMemories();
      return;
    }
    const res = await fetch('/api/drive-ai/memories/search', {
      body: JSON.stringify({ query: searchQuery }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    if (res.ok) setMemories(await res.json());
  };

  const toggleStar = async (memory: Memory) => {
    await fetch(`/api/drive-ai/memories/${memory.id}`, {
      body: JSON.stringify({ is_starred: !memory.is_starred }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });
    loadMemories();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Memory</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="Search memories..."
          value={searchQuery}
          style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 6,
            color: '#e2e8f0',
            flex: 1,
            fontSize: 14,
            padding: '8px 12px',
          }}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          style={{
            background: '#6366f1',
            border: 'none',
            borderRadius: 6,
            color: '#fff',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {categories.map((c) => (
          <button
            key={c}
            style={{
              background: category === c ? '#334155' : '#1e293b',
              border: 'none',
              borderRadius: 6,
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: 12,
              padding: '6px 10px',
            }}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {memories.length === 0 && (
        <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
          No memories yet. Your assistant will remember things from conversations automatically.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {memories.map((m) => (
          <div
            key={m.id}
            style={{
              background: '#1e293b',
              borderRadius: 8,
              display: 'flex',
              gap: 12,
              padding: '12px 16px',
            }}
          >
            <button
              style={{
                background: 'none',
                border: 'none',
                color: m.is_starred ? '#f59e0b' : '#475569',
                cursor: 'pointer',
                fontSize: 18,
                padding: 0,
              }}
              onClick={() => toggleStar(m)}
            >
              {m.is_starred ? '\u2605' : '\u2606'}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14 }}>{m.content}</div>
              <div
                style={{ color: '#64748b', display: 'flex', fontSize: 12, gap: 12, marginTop: 6 }}
              >
                <span style={{ background: '#334155', borderRadius: 4, padding: '1px 6px' }}>
                  {m.category}
                </span>
                <span>{m.memory_type}</span>
                <span>{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
