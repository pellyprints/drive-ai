'use client';

import { useEffect, useState } from 'react';

interface Decision {
  content: string;
  context: string | null;
  created_at: string;
  id: string;
  project_id: string | null;
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/drive-ai/decisions');
      if (res.ok) setDecisions(await res.json());
    }
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Decisions</h1>

      {decisions.length === 0 && (
        <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
          No decisions recorded yet. Your AI assistant will log important decisions from
          conversations.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {decisions.map((d) => (
          <div key={d.id} style={{ background: '#1e293b', borderRadius: 8, padding: '16px 20px' }}>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{d.content}</div>
            {d.context && (
              <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>{d.context}</div>
            )}
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              {new Date(d.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
