'use client';

import { useCallback, useEffect, useState } from 'react';

interface Project {
  color: string;
  created_at: string;
  description: string | null;
  id: string;
  name: string;
  status: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newName, setNewName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const loadProjects = useCallback(async () => {
    const res = await fetch('/api/drive-ai/projects');
    if (res.ok) setProjects(await res.json());
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = async () => {
    if (!newName.trim()) return;
    await fetch('/api/drive-ai/projects', {
      body: JSON.stringify({ name: newName }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
    });
    setNewName('');
    setShowForm(false);
    loadProjects();
  };

  return (
    <div>
      <div style={{ alignItems: 'center', display: 'flex', gap: 16, marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Projects</h1>
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
          + New Project
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#1e293b', borderRadius: 8, marginBottom: 16, padding: 16 }}>
          <input
            autoFocus
            placeholder="Project name..."
            value={newName}
            style={{
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#e2e8f0',
              fontSize: 14,
              padding: '8px 12px',
              width: '100%',
            }}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createProject()}
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
              onClick={createProject}
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

      {projects.length === 0 && (
        <div style={{ color: '#64748b', padding: 40, textAlign: 'center' }}>
          No projects yet. Create one to organize your tasks.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {projects.map((project) => (
          <div
            key={project.id}
            style={{
              background: '#1e293b',
              borderLeft: `4px solid ${project.color || '#6366f1'}`,
              borderRadius: 8,
              padding: '16px 20px',
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 600 }}>{project.name}</div>
            {project.description && (
              <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>
                {project.description}
              </div>
            )}
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              {project.status} · Created {new Date(project.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
