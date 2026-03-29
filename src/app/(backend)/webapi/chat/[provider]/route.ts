import { type ChatCompletionErrorPayload, type ModelRuntime } from '@lobechat/model-runtime';
import { AGENT_RUNTIME_ERROR_SET } from '@lobechat/model-runtime';
import { ChatErrorType } from '@lobechat/types';

import { checkAuth } from '@/app/(backend)/middleware/auth';
import { createTraceOptions, initModelRuntimeFromDB } from '@/server/modules/ModelRuntime';
import { type ChatStreamPayload } from '@/types/openai/chat';
import { buildSystemPrompt } from '@/utils/drive-ai/system-prompt-builder';
import { createErrorResponse } from '@/utils/errorResponse';
import { getTracePayload } from '@/utils/trace';

// If user don't use fluid compute, will build  failed
// this enforce user to enable fluid compute
export const maxDuration = 300;

export const POST = checkAuth(
  async (req: Request, { params, userId, serverDB, createRuntime, jwtPayload }) => {
    const provider = (await params)!.provider!;

    try {
      // ============  1. init chat model   ============ //
      let modelRuntime: ModelRuntime;
      if (createRuntime) {
        // Legacy support for custom runtime creation
        modelRuntime = createRuntime(jwtPayload);
      } else {
        // Read user's provider config from database
        modelRuntime = await initModelRuntimeFromDB(serverDB, userId, provider);
      }

      // ============  2. create chat completion   ============ //

      const data = (await req.json()) as ChatStreamPayload;

      // ============  Drive AI: inject dynamic system prompt  ============ //
      try {
        const drivePrompt = await buildSystemPrompt(userId);
        if (drivePrompt && data.messages?.length > 0) {
          // Prepend Drive AI context to the first system message, or add one
          const firstMsg = data.messages[0];
          if (firstMsg?.role === 'system') {
            firstMsg.content = drivePrompt + '\n\n' + (firstMsg.content || '');
          } else {
            data.messages.unshift({ content: drivePrompt, role: 'system' });
          }
        }
      } catch (e) {
        // Non-blocking — if prompt building fails, proceed with default
        console.warn('[Drive AI] System prompt build failed:', e);
      }

      const tracePayload = getTracePayload(req);

      let traceOptions = {};
      // If user enable trace
      if (tracePayload?.enabled) {
        traceOptions = createTraceOptions(data, { provider, trace: tracePayload });
      }

      return await modelRuntime.chat(data, {
        user: userId,
        ...traceOptions,
        signal: req.signal,
      });
    } catch (e) {
      const {
        errorType = ChatErrorType.InternalServerError,
        error: errorContent,
        ...res
      } = e as ChatCompletionErrorPayload;

      const error = errorContent || e;

      const logMethod = AGENT_RUNTIME_ERROR_SET.has(errorType as string) ? 'warn' : 'error';
      // track the error at server side
      // eslint-disable-next-line no-console
      console[logMethod](`Route: [${provider}] ${errorType}:`, error);

      return createErrorResponse(errorType, { error, ...res, provider });
    }
  },
);
