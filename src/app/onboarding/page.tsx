'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Step = 'name' | 'welcome' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [assistantName, setAssistantName] = useState('Drive');

  const saveName = async () => {
    await fetch('/api/drive-ai/profile', {
      body: JSON.stringify({ assistant_name: assistantName, onboarding_complete: true }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PUT',
    });
    setStep('done');
  };

  return (
    <div
      style={{
        alignItems: 'center',
        background: '#0f172a',
        color: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      {step === 'welcome' && (
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x1F44B;</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Welcome to Drive AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Your personal AI assistant that remembers, thinks, and helps you stay organized. Talk to
            it like you would a trusted colleague.
          </p>
          <button
            style={{
              background: '#6366f1',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              padding: '14px 40px',
            }}
            onClick={() => setStep('name')}
          >
            Get Started
          </button>
        </div>
      )}

      {step === 'name' && (
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Name your assistant</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
            What would you like to call me? You can always change this later.
          </p>
          <input
            autoFocus
            placeholder="Drive"
            value={assistantName}
            style={{
              background: '#1e293b',
              border: '2px solid #334155',
              borderRadius: 12,
              color: '#e2e8f0',
              fontSize: 20,
              marginBottom: 24,
              padding: '14px 20px',
              textAlign: 'center',
              width: 280,
            }}
            onChange={(e) => setAssistantName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveName()}
          />
          <br />
          <button
            style={{
              background: '#6366f1',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 16,
              padding: '14px 40px',
            }}
            onClick={saveName}
          >
            Continue
          </button>
        </div>
      )}

      {step === 'done' && (
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#x2705;</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            {assistantName || 'Drive'} is ready!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32 }}>
            Just start talking. Say &ldquo;add to my list&rdquo; to create tasks, ask questions, or
            just chat. {assistantName || 'Drive'} remembers everything.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              style={{
                background: '#6366f1',
                border: 'none',
                borderRadius: 12,
                color: '#fff',
                cursor: 'pointer',
                fontSize: 16,
                padding: '14px 32px',
              }}
              onClick={() => router.push('/')}
            >
              Start Chatting
            </button>
            <button
              style={{
                background: '#334155',
                border: 'none',
                borderRadius: 12,
                color: '#e2e8f0',
                cursor: 'pointer',
                fontSize: 16,
                padding: '14px 32px',
              }}
              onClick={() => router.push('/dashboard')}
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
