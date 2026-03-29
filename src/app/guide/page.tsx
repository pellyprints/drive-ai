export default function GuidePage() {
  return (
    <div
      style={{
        background: '#0f172a',
        color: '#e2e8f0',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        margin: '0 auto',
        maxWidth: 640,
        padding: '40px 24px',
      }}
    >
      <h1 style={{ color: '#818cf8', fontSize: 28, marginBottom: 8 }}>Drive AI Quick Start</h1>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>
        Your personal AI assistant. Here&apos;s everything you need to know.
      </p>

      <Section title="Getting Started">
        <Step n={1}>
          Go to <strong>drive-ai-eight.vercel.app</strong>
        </Step>
        <Step n={2}>Sign in with your email and password</Step>
        <Step n={3}>Start typing or tap the mic button to talk</Step>
      </Section>

      <Section title="Talking to Drive">
        <Tip>Tap the microphone icon, speak naturally, then wait for a response</Tip>
        <Tip>Drive reads responses aloud automatically</Tip>
        <Tip>
          Ask anything: &ldquo;What meetings do I have?&rdquo; &ldquo;Add buy supplies to my
          list&rdquo;
        </Tip>
      </Section>

      <Section title="Driving Mode">
        <Tip>
          Go to <strong>/driving-mode</strong> for a hands-free, voice-only screen
        </Tip>
        <Tip>Big mic button in the center &mdash; tap once, speak, get audio response</Tip>
        <Tip>Screen stays on while driving mode is active</Tip>
      </Section>

      <Section title="Your Dashboard">
        <Tip>
          Go to <strong>/dashboard</strong> to see your tasks, projects, memories, and decisions
        </Tip>
        <Tip>Create tasks and projects from the dashboard or by voice</Tip>
        <Tip>Drive remembers things you tell it and shows them in the Memory section</Tip>
      </Section>

      <Section title="Tips">
        <Tip>
          Say &ldquo;remember that Henderson prefers morning meetings&rdquo; &mdash; Drive will save
          it
        </Tip>
        <Tip>Say &ldquo;add call plumber to my list, due Friday&rdquo; &mdash; creates a task</Tip>
        <Tip>Say &ldquo;we decided to go with vendor B&rdquo; &mdash; Drive logs the decision</Tip>
        <Tip>Your data is private &mdash; stored in your own database, not shared with anyone</Tip>
      </Section>

      <div
        style={{
          borderTop: '1px solid #1e293b',
          color: '#64748b',
          fontSize: 12,
          marginTop: 40,
          paddingTop: 16,
        }}
      >
        Built by Pelly Enterprises. Questions? Ask Drive &mdash; it can help with that too.
      </div>
    </div>
  );
}

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          borderBottom: '1px solid #1e293b',
          fontSize: 18,
          fontWeight: 600,
          marginBottom: 12,
          paddingBottom: 8,
        }}
      >
        {title}
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  );
}

function Step({ children, n }: { children: React.ReactNode; n: number }) {
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: 12 }}>
      <span
        style={{
          alignItems: 'center',
          background: '#6366f1',
          borderRadius: '50%',
          color: '#fff',
          display: 'flex',
          flexShrink: 0,
          fontSize: 14,
          fontWeight: 700,
          height: 28,
          justifyContent: 'center',
          width: 28,
        }}
      >
        {n}
      </span>
      <span style={{ fontSize: 15 }}>{children}</span>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{ alignItems: 'flex-start', display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.5 }}
    >
      <span style={{ color: '#818cf8', flexShrink: 0 }}>&#x2022;</span>
      <span>{children}</span>
    </div>
  );
}
