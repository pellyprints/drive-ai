import { and, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveMemories } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const params = request.nextUrl.searchParams;
  const category = params.get('category');
  const isStarred = params.get('is_starred');
  const limit = parseInt(params.get('limit') || '50', 10);

  const conditions = [eq(driveMemories.userId, user.id)];
  if (category) conditions.push(eq(driveMemories.category, category));
  if (isStarred === 'true') conditions.push(eq(driveMemories.isStarred, true));

  const rows = await db
    .select({
      category: driveMemories.category,
      content: driveMemories.content,
      createdAt: driveMemories.createdAt,
      id: driveMemories.id,
      isStarred: driveMemories.isStarred,
      memoryType: driveMemories.memoryType,
      sourceConversationId: driveMemories.sourceConversationId,
      stalenessDate: driveMemories.stalenessDate,
      userId: driveMemories.userId,
    })
    .from(driveMemories)
    .where(and(...conditions))
    .orderBy(desc(driveMemories.createdAt))
    .limit(limit);

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.content) {
    return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
  }

  // Store memory without embedding for now — embedding generation
  // will be added when Supabase ai.embed is available or via Edge Function
  const [memory] = await db
    .insert(driveMemories)
    .values({
      category: body.category,
      content: body.content,
      memoryType: body.memory_type || 'general',
      sourceConversationId: body.source_conversation_id,
      userId: user.id,
    })
    .returning();

  return NextResponse.json(memory, { status: 201 });
}
