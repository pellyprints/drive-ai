'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Stats {
  decisions: number;
  memories: number;
  openTasks: number;
  projects: number;
  upcomingReminders: number;
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: '#1e293b',
        borderRadius: 12,
        flex: 1,
        minWidth: 150,
        padding: '20px 24px',
      }}
    >
      <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>{label}</div>
      <div style={{ color: '#e2e8f0', fontSize: 32, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

export default function DashboardOverview() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    decisions: 0,
    memories: 0,
    openTasks: 0,
    projects: 0,
    upcomingReminders: 0,
  });

  // Check if onboarding is needed — redirect to /onboarding if not complete
  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch('/api/drive-ai/profile');
        if (res.ok) {
          const profile = await res.json();
          if (!profile.onboarding_complete) {
            router.push('/onboarding');
          }
        }
      } catch {
        // Profile API not ready — skip redirect
      }
    }
    checkOnboarding();
  }, [router]);

  useEffect(() => {
    async function load() {
      try {
        const [todos, projects, memories, decisions, reminders] = await Promise.all([
          fetch('/api/drive-ai/todos?status=open').then((r) => r.json()),
          fetch('/api/drive-ai/projects').then((r) => r.json()),
          fetch('/api/drive-ai/memories?limit=1000').then((r) => r.json()),
          fetch('/api/drive-ai/decisions').then((r) => r.json()),
          fetch('/api/drive-ai/reminders?upcoming=true').then((r) => r.json()),
        ]);
        setStats({
          decisions: Array.isArray(decisions) ? decisions.length : 0,
          memories: Array.isArray(memories) ? memories.length : 0,
          openTasks: Array.isArray(todos) ? todos.length : 0,
          projects: Array.isArray(projects) ? projects.length : 0,
          upcomingReminders: Array.isArray(reminders) ? reminders.length : 0,
        });
      } catch {
        // Auth not ready or API error — show zeros
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <StatCard label="Open Tasks" value={stats.openTasks} />
        <StatCard label="Projects" value={stats.projects} />
        <StatCard label="Memories" value={stats.memories} />
        <StatCard label="Decisions" value={stats.decisions} />
        <StatCard label="Upcoming Reminders" value={stats.upcomingReminders} />
      </div>
    </div>
  );
}
