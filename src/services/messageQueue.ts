import { type QueuedMessage } from '@/store/chat/slices/operation/types';

/**
 * Merged message ready for injection
 */
export interface MergedQueuedMessage {
  content: string;
  files: string[];
}

/**
 * Merge multiple queued messages into a single message for injection.
 * Messages are sorted by creation time and content is joined with double newlines.
 */
export const mergeQueuedMessages = (messages: QueuedMessage[]): MergedQueuedMessage => {
  const sorted = [...messages].sort((a, b) => a.createdAt - b.createdAt);

  const content = sorted.map((m) => m.content).join('\n\n');
  const files = sorted.flatMap((m) => m.files ?? []);

  return { content, files };
};
