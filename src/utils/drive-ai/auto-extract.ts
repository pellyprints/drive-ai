import { driveDecisions, driveMemories } from '@/database/schemas';

import { db } from './db';

const EXTRACTION_PROMPT = `Analyze this conversation exchange and extract:
1. Facts worth remembering (names, dates, preferences, relationships)
2. Decisions made (choices, commitments, directions taken)

Return JSON only, no explanation:
{
  "memories": [{"content": "...", "category": "General|Business Ideas|Decisions|People|Personal"}],
  "decisions": [{"content": "...", "context": "..."}]
}

If nothing worth extracting, return: {"memories": [], "decisions": []}`;

/**
 * Background extraction — fire and forget after AI response.
 * Uses the same Anthropic API key, calls Haiku for low cost.
 */
export async function extractFromConversation(
  userId: string,
  userMessage: string,
  assistantResponse: string,
  conversationId?: string,
) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      body: JSON.stringify({
        max_tokens: 500,
        messages: [
          {
            content: `User: ${userMessage}\n\nAssistant: ${assistantResponse}`,
            role: 'user',
          },
        ],
        model: 'claude-haiku-4-5-20251001',
        system: EXTRACTION_PROMPT,
      }),
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'x-api-key': apiKey,
      },
      method: 'POST',
    });

    if (!response.ok) return;

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) return;

    const extracted = JSON.parse(text);

    // Store extracted memories
    if (extracted.memories?.length > 0) {
      for (const m of extracted.memories) {
        await db.insert(driveMemories).values({
          category: m.category || 'General',
          content: m.content,
          memoryType: 'extracted',
          sourceConversationId: conversationId,
          userId,
        });
      }
    }

    // Store extracted decisions
    if (extracted.decisions?.length > 0) {
      for (const d of extracted.decisions) {
        await db.insert(driveDecisions).values({
          content: d.content,
          context: d.context,
          conversationId,
          userId,
        });
      }
    }
  } catch {
    // Non-blocking — extraction failure should never break chat
  }
}
