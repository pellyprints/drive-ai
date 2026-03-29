'use client';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        justifyContent: 'center',
        minHeight: '60vh',
        padding: 40,
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: 48 }}>&#x26A0;&#xFE0F;</div>
      <h2 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h2>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>
        Don&apos;t worry, your data is safe. Try refreshing the page.
      </p>
      <button
        style={{
          background: '#6366f1',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          cursor: 'pointer',
          fontSize: 14,
          padding: '10px 24px',
        }}
        onClick={reset}
      >
        Try Again
      </button>
    </div>
  );
}
