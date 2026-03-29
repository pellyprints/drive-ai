import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveDecisions, driveProjects, driveTodos } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const [project] = await db
    .select()
    .from(driveProjects)
    .where(and(eq(driveProjects.id, id), eq(driveProjects.userId, user.id)));

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const todos = await db
    .select()
    .from(driveTodos)
    .where(and(eq(driveTodos.projectId, id), eq(driveTodos.userId, user.id)));

  const decisions = await db
    .select()
    .from(driveDecisions)
    .where(and(eq(driveDecisions.projectId, id), eq(driveDecisions.userId, user.id)));

  return NextResponse.json({ ...project, decisions, todos });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.status !== undefined) updates.status = body.status;
  if (body.color !== undefined) updates.color = body.color;

  const [project] = await db
    .update(driveProjects)
    .set(updates)
    .where(and(eq(driveProjects.id, id), eq(driveProjects.userId, user.id)))
    .returning();

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(project);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const [deleted] = await db
    .delete(driveProjects)
    .where(and(eq(driveProjects.id, id), eq(driveProjects.userId, user.id)))
    .returning();

  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
