import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveMemories } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.content !== undefined) updates.content = body.content;
  if (body.is_starred !== undefined) updates.isStarred = body.is_starred;
  if (body.category !== undefined) updates.category = body.category;

  const [memory] = await db
    .update(driveMemories)
    .set(updates)
    .where(and(eq(driveMemories.id, id), eq(driveMemories.userId, user.id)))
    .returning();

  if (!memory) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(memory);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const [deleted] = await db
    .delete(driveMemories)
    .where(and(eq(driveMemories.id, id), eq(driveMemories.userId, user.id)))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
