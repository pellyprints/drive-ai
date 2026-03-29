import { and, desc, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveDecisions } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const projectId = request.nextUrl.searchParams.get('project_id');
  const conditions = [eq(driveDecisions.userId, user.id)];
  if (projectId) conditions.push(eq(driveDecisions.projectId, projectId));

  const rows = await db
    .select()
    .from(driveDecisions)
    .where(and(...conditions))
    .orderBy(desc(driveDecisions.createdAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.content) {
    return NextResponse.json({ error: 'Missing required field: content' }, { status: 400 });
  }

  const [decision] = await db
    .insert(driveDecisions)
    .values({
      content: body.content,
      context: body.context,
      conversationId: body.conversation_id,
      projectId: body.project_id,
      userId: user.id,
    })
    .returning();

  return NextResponse.json(decision, { status: 201 });
}
