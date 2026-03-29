'use client';

import './theme.css';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';

const navItems = [
  { href: '/dashboard', icon: '⊞', label: 'Overview' },
  { href: '/dashboard/tasks', icon: '☑', label: 'Tasks' },
  { href: '/dashboard/projects', icon: '◈', label: 'Projects' },
  { href: '/dashboard/calendar', icon: '▦', label: 'Calendar' },
  { href: '/dashboard/decisions', icon: '⚖', label: 'Decisions' },
  { href: '/dashboard/memory', icon: '◉', label: 'Memory' },
  { href: '/', icon: '◀', label: 'Chat' },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        minHeight: '100vh',
        padding: '16px 8px',
        width: 220,
      }}
    >
      <div
        style={{
          color: '#818cf8',
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 16,
          padding: '8px 12px',
        }}
      >
        Drive AI
      </div>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            href={item.href}
            key={item.href}
            style={{
              alignItems: 'center',
              background: isActive ? '#1e293b' : 'transparent',
              borderRadius: 8,
              color: isActive ? '#e2e8f0' : '#94a3b8',
              display: 'flex',
              fontSize: 14,
              gap: 10,
              padding: '10px 12px',
              textDecoration: 'none',
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: '#0f172a', color: '#e2e8f0', display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
