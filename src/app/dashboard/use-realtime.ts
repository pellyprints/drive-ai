'use client';

import { useEffect } from 'react';

/**
 * Simple realtime refresh hook using polling.
 * Supabase Realtime JS client would need @supabase/supabase-js installed on client,
 * which adds bundle size. Polling every 5s is simpler for a single-user app.
 */
export function useRealtimeRefresh(refreshFn: () => void, intervalMs = 5000) {
  useEffect(() => {
    const timer = setInterval(refreshFn, intervalMs);
    return () => clearInterval(timer);
  }, [refreshFn, intervalMs]);
}
