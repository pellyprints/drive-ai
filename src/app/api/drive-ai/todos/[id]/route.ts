import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveTodos } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const [todo] = await db
    .select()
    .from(driveTodos)
    .where(and(eq(driveTodos.id, id), eq(driveTodos.userId, user.id)));

  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(todo);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.status !== undefined) updates.status = body.status;
  if (body.priority !== undefined) updates.priority = body.priority;
  if (body.due_date !== undefined) updates.dueDate = body.due_date ? new Date(body.due_date) : null;
  if (body.project_id !== undefined) updates.projectId = body.project_id;

  const [todo] = await db
    .update(driveTodos)
    .set(updates)
    .where(and(eq(driveTodos.id, id), eq(driveTodos.userId, user.id)))
    .returning();

  if (!todo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(todo);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const [deleted] = await db
    .delete(driveTodos)
    .where(and(eq(driveTodos.id, id), eq(driveTodos.userId, user.id)))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
