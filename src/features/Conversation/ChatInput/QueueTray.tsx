'use client';

import { ActionIcon, Flexbox, Icon } from '@lobehub/ui';
import { ListEnd, Trash2 } from 'lucide-react';
import { memo, useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { operationSelectors } from '@/store/chat/selectors';
import { messageMapKey } from '@/store/chat/utils/messageMapKey';

import { useConversationStore } from '../store';

const QueueTray = memo(() => {
  const context = useConversationStore((s) => s.context);

  const contextKey = useMemo(
    () =>
      messageMapKey({
        agentId: context.agentId,
        groupId: context.groupId,
        topicId: context.topicId,
      }),
    [context.agentId, context.groupId, context.topicId],
  );

  const queuedMessages = useChatStore((s) => operationSelectors.getQueuedMessages(context)(s));
  const removeQueuedMessage = useChatStore((s) => s.removeQueuedMessage);

  if (queuedMessages.length === 0) return null;

  return (
    <Flexbox gap={4} paddingInline={4} style={{ marginBottom: 4 }}>
      {queuedMessages.map((msg) => (
        <Flexbox
          horizontal
          align="center"
          gap={8}
          key={msg.id}
          style={{
            background: 'var(--ant-color-fill-quaternary)',
            border: '1px solid var(--ant-color-border-secondary)',
            borderRadius: 8,
            padding: '6px 8px 6px 12px',
          }}
        >
          <Icon
            icon={ListEnd}
            size={14}
            style={{ color: 'var(--ant-color-text-description)', flexShrink: 0 }}
          />
          <Flexbox
            flex={1}
            style={{
              fontSize: 13,
              lineHeight: 1.4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {msg.content}
          </Flexbox>
          <ActionIcon
            icon={Trash2}
            size="small"
            onClick={() => removeQueuedMessage(contextKey, msg.id)}
          />
        </Flexbox>
      ))}
    </Flexbox>
  );
});

QueueTray.displayName = 'QueueTray';

export default QueueTray;
