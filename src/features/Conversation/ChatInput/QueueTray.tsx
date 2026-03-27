'use client';

import { Flexbox, Icon, Tag } from '@lobehub/ui';
import { ListEnd, X } from 'lucide-react';
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

  const queueCount = useChatStore((s) => operationSelectors.queuedMessageCount(context)(s));

  const queuedMessages = useChatStore((s) => operationSelectors.getQueuedMessages(context)(s));

  const removeQueuedMessage = useChatStore((s) => s.removeQueuedMessage);

  if (queueCount === 0) return null;

  return (
    <Flexbox
      horizontal
      align="center"
      gap={8}
      paddingBlock={4}
      paddingInline={12}
      style={{ fontSize: 12, opacity: 0.7 }}
    >
      <Icon icon={ListEnd} size={14} />
      <Tag size="small">{queueCount} Queued</Tag>
      <Flexbox horizontal flex={1} gap={4} style={{ overflow: 'hidden' }}>
        {queuedMessages.map((msg) => (
          <Flexbox
            horizontal
            align="center"
            gap={4}
            key={msg.id}
            style={{
              background: 'rgba(0,0,0,0.04)',
              borderRadius: 4,
              fontSize: 11,
              maxWidth: 200,
              overflow: 'hidden',
              paddingBlock: 2,
              paddingInline: 6,
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg.content}</span>
            <Icon
              icon={X}
              size={12}
              style={{ cursor: 'pointer', flexShrink: 0 }}
              onClick={() => removeQueuedMessage(contextKey, msg.id)}
            />
          </Flexbox>
        ))}
      </Flexbox>
    </Flexbox>
  );
});

QueueTray.displayName = 'QueueTray';

export default QueueTray;
