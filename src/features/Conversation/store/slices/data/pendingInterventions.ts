import type { ChatToolPayloadWithResult, ToolIntervention, UIChatMessage } from '@lobechat/types';

export interface PendingIntervention {
  apiName: string;
  identifier: string;
  intervention: ToolIntervention;
  requestArgs: string;
  toolCallId: string;
  toolMessageId: string;
}

export const getPendingInterventions = (
  displayMessages: UIChatMessage[],
): PendingIntervention[] => {
  const pending: PendingIntervention[] = [];

  for (const msg of displayMessages) {
    // assistantGroup messages: check children blocks for tools
    if (msg.role === 'assistantGroup' && msg.children) {
      for (const block of msg.children) {
        if (!block.tools) continue;
        collectPendingTools(block.tools, pending);
      }
    }
  }

  return pending;
};

const collectPendingTools = (
  tools: ChatToolPayloadWithResult[],
  pending: PendingIntervention[],
) => {
  for (const tool of tools) {
    if (tool.intervention?.status === 'pending' && tool.result_msg_id) {
      pending.push({
        apiName: tool.apiName,
        identifier: tool.identifier,
        intervention: tool.intervention,
        requestArgs: tool.arguments || '',
        toolCallId: tool.id,
        toolMessageId: tool.result_msg_id,
      });
    }
  }
};
