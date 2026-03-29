import { and, desc, eq, sql } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveMemories } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.query) {
    return NextResponse.json({ error: 'Missing required field: query' }, { status: 400 });
  }

  const limit = body.limit || 10;

  // Text-based search fallback (ILIKE) until embeddings are generated
  // When embeddings are available, this will use cosine similarity via pgvector
  const rows = await db
    .select({
      category: driveMemories.category,
      content: driveMemories.content,
      createdAt: driveMemories.createdAt,
      id: driveMemories.id,
      isStarred: driveMemories.isStarred,
      memoryType: driveMemories.memoryType,
    })
    .from(driveMemories)
    .where(
      and(
        eq(driveMemories.userId, user.id),
        sql`${driveMemories.content} ILIKE ${'%' + body.query + '%'}`,
      ),
    )
    .orderBy(desc(driveMemories.createdAt))
    .limit(limit);

  return NextResponse.json(rows);
}
