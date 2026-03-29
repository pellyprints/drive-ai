'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

type Mode = 'idle' | 'listening' | 'processing' | 'speaking';

export default function DrivingModePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('idle');
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Request Wake Lock to prevent screen sleep
  useEffect(() => {
    async function acquireWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          setWakeLock(lock);
        }
      } catch {
        // Wake Lock not available
      }
    }
    acquireWakeLock();
    return () => {
      wakeLock?.release();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setMode('listening');
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setMode('processing');

      try {
        // Send to Claude via LobeChat's chat API
        const res = await fetch('/api/drive-ai/chat-proxy', {
          body: JSON.stringify({ message: transcript }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioUrl) {
            setMode('speaking');
            const audio = new Audio(data.audioUrl);
            audio.onended = () => setMode('idle');
            await audio.play();
          } else {
            setMode('idle');
          }
        } else {
          setMode('idle');
        }
      } catch {
        setMode('idle');
      }
    };
    recognition.onerror = () => setMode('idle');
    recognition.onend = () => {
      if (mode === 'listening') setMode('idle');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [mode]);

  const micColor = {
    idle: '#6366f1',
    listening: '#ef4444',
    processing: '#f59e0b',
    speaking: '#22c55e',
  }[mode];

  const pulseAnimation = mode === 'listening' ? 'pulse 1.5s ease-in-out infinite' : 'none';

  return (
    <div
      style={{
        alignItems: 'center',
        background: '#0a0e1a',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        justifyContent: 'center',
        position: 'relative',
        width: '100vw',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 30px rgba(99,102,241,0); }
        }
      `}</style>

      {/* Status indicator */}
      <div style={{ color: '#64748b', fontSize: 14, marginBottom: 40, textTransform: 'uppercase' }}>
        {mode === 'idle' && 'Tap to speak'}
        {mode === 'listening' && 'Listening...'}
        {mode === 'processing' && 'Thinking...'}
        {mode === 'speaking' && 'Speaking...'}
      </div>

      {/* Giant mic button */}
      <button
        disabled={mode !== 'idle'}
        style={{
          animation: pulseAnimation,
          background: micColor,
          border: 'none',
          borderRadius: '50%',
          color: '#fff',
          cursor: mode === 'idle' ? 'pointer' : 'default',
          fontSize: 48,
          height: 120,
          transition: 'background 0.3s',
          width: 120,
        }}
        onClick={startListening}
      >
        {mode === 'speaking' ? '\u{1F50A}' : '\u{1F399}'}
      </button>

      {/* Bottom controls */}
      <div
        style={{
          bottom: 60,
          display: 'flex',
          gap: 40,
          justifyContent: 'center',
          left: 0,
          position: 'absolute',
          right: 0,
        }}
      >
        <button
          style={{
            background: '#334155',
            border: 'none',
            borderRadius: 16,
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: 14,
            padding: '12px 24px',
          }}
          onClick={() => router.push('/')}
        >
          End
        </button>
        <button
          style={{
            background: '#334155',
            border: 'none',
            borderRadius: 16,
            color: '#e2e8f0',
            cursor: 'pointer',
            fontSize: 14,
            padding: '12px 24px',
          }}
        >
          Repeat
        </button>
      </div>
    </div>
  );
}
