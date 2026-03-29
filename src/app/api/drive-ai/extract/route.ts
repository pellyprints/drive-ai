import { type NextRequest, NextResponse } from 'next/server';

import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { extractFromConversation } from '@/utils/drive-ai/auto-extract';

export const runtime = 'nodejs';

/**
 * POST /api/drive-ai/extract
 * Called by the client after each AI response to extract memories/decisions.
 * Fire-and-forget — returns immediately, extraction runs in background.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const { user_message, assistant_response, conversation_id } = body;

  if (!user_message || !assistant_response) {
    return NextResponse.json(
      { error: 'Missing user_message or assistant_response' },
      { status: 400 },
    );
  }

  // Don't await — fire and forget
  extractFromConversation(user.id, user_message, assistant_response, conversation_id);

  return NextResponse.json({ status: 'extracting' });
}
