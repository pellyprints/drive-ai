import { LOADING_FLAT } from '@lobechat/const';
import { useEffect, useRef } from 'react';

import { useChatStore } from '@/store/chat';

/**
 * Auto-play TTS when an assistant message finishes generating.
 * Only triggers on the transition from generating=true to generating=false,
 * so it won't fire on page reload or for messages that were never generating.
 */
export const useAutoPlayTTS = (
  messageId: string,
  content: string,
  generating: boolean,
  hasError: boolean,
) => {
  const prevGeneratingRef = useRef<boolean | null>(null);

  useEffect(() => {
    const prev = prevGeneratingRef.current;
    prevGeneratingRef.current = generating;

    // Only trigger when transitioning from generating -> not generating
    if (prev === true && !generating && content && content !== LOADING_FLAT && !hasError) {
      // Auto-trigger TTS for this message
      useChatStore.getState().ttsMessage(messageId);
    }
  }, [generating, messageId, content, hasError]);
};
