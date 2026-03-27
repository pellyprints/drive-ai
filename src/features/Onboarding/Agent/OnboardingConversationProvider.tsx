'use client';

import { type ReactNode, useRef } from 'react';
import { memo, useMemo } from 'react';

import { type ConversationHooks, ConversationProvider } from '@/features/Conversation';
import { useOperationState } from '@/hooks/useOperationState';
import { useChatStore } from '@/store/chat';
import { type MessageMapKeyInput } from '@/store/chat/utils/messageMapKey';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

interface OnboardingConversationProviderProps {
  agentId: string;
  children: ReactNode;
  frozen?: boolean;
  hooks?: ConversationHooks;
  topicId: string;
}

const OnboardingConversationProvider = memo<OnboardingConversationProviderProps>(
  ({ agentId, children, frozen, hooks, topicId }) => {
    const context = useMemo<MessageMapKeyInput>(
      () => ({
        agentId,
        topicId,
      }),
      [agentId, topicId],
    );
    const chatKey = useMemo(() => messageMapKey(context), [context]);
    const replaceMessages = useChatStore((s) => s.replaceMessages);
    const messages = useChatStore((s) => s.dbMessagesMap[chatKey]);
    const operationState = useOperationState(context);

    // Snapshot messages when frozen flips to true (onboarding finished).
    // After finishOnboarding the topic is transferred to inbox agent in DB,
    // so any SWR revalidation (focus, reconnect, etc.) with the old context
    // would return empty and wipe the conversation. The snapshot keeps the
    // messages alive on the client regardless of subsequent fetches.
    const snapshotRef = useRef(messages);
    if (!frozen) {
      snapshotRef.current = messages;
    }
    const effectiveMessages = frozen ? snapshotRef.current : messages;

    return (
      <ConversationProvider
        context={context}
        hasInitMessages={!!effectiveMessages}
        hooks={hooks}
        messages={effectiveMessages}
        operationState={operationState}
        onMessagesChange={
          frozen
            ? undefined
            : (msgs, ctx) => {
                replaceMessages(msgs, { context: ctx });
              }
        }
      >
        {children}
      </ConversationProvider>
    );
  },
);

OnboardingConversationProvider.displayName = 'OnboardingConversationProvider';

export default OnboardingConversationProvider;
