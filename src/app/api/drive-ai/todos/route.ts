import { and, asc, desc, eq, gte, lte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveTodos } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const params = request.nextUrl.searchParams;
  const status = params.get('status');
  const projectId = params.get('project_id');
  const dueBefore = params.get('due_before');
  const dueAfter = params.get('due_after');
  const sortBy = params.get('sort_by') || 'created_at';
  const sortOrder = params.get('sort_order') || 'desc';

  const conditions = [eq(driveTodos.userId, user.id)];
  if (status) conditions.push(eq(driveTodos.status, status));
  if (projectId) conditions.push(eq(driveTodos.projectId, projectId));
  if (dueBefore) conditions.push(lte(driveTodos.dueDate, new Date(dueBefore)));
  if (dueAfter) conditions.push(gte(driveTodos.dueDate, new Date(dueAfter)));

  const sortCol =
    sortBy === 'due_date'
      ? driveTodos.dueDate
      : sortBy === 'priority'
        ? driveTodos.priority
        : driveTodos.createdAt;

  const rows = await db
    .select()
    .from(driveTodos)
    .where(and(...conditions))
    .orderBy(sortOrder === 'asc' ? asc(sortCol) : desc(sortCol));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: 'Missing required field: title' }, { status: 400 });
  }

  const [todo] = await db
    .insert(driveTodos)
    .values({
      description: body.description,
      dueDate: body.due_date ? new Date(body.due_date) : undefined,
      priority: body.priority,
      projectId: body.project_id,
      status: body.status,
      title: body.title,
      userId: user.id,
    })
    .returning();

  return NextResponse.json(todo, { status: 201 });
}
