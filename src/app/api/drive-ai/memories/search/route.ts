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

  // Multi-word search: split query into words and match any word (OR logic)
  // Supabase free tier doesn't have ai.embed — using text search as fallback
  // TODO: Upgrade to pgvector cosine similarity when Supabase Pro or external embeddings
  const words = body.query
    .trim()
    .split(/\s+/)
    .filter((w: string) => w.length > 2);
  const searchCondition =
    words.length > 0
      ? sql`(${sql.join(
          words.map((w: string) => sql`${driveMemories.content} ILIKE ${'%' + w + '%'}`),
          sql` OR `,
        )})`
      : sql`${driveMemories.content} ILIKE ${'%' + body.query + '%'}`;

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
    .where(and(eq(driveMemories.userId, user.id), searchCondition))
    .orderBy(desc(driveMemories.createdAt))
    .limit(limit);

  return NextResponse.json(rows);
}
