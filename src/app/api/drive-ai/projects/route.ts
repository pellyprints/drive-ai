import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveProjects } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const projects = await db
    .select()
    .from(driveProjects)
    .where(eq(driveProjects.userId, user.id))
    .orderBy(driveProjects.createdAt);

  return NextResponse.json(projects);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.name) {
    return NextResponse.json({ error: 'Missing required field: name' }, { status: 400 });
  }

  const [project] = await db
    .insert(driveProjects)
    .values({
      color: body.color,
      description: body.description,
      name: body.name,
      userId: user.id,
    })
    .returning();

  return NextResponse.json(project, { status: 201 });
}
