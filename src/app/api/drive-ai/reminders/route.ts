import { and, desc, eq, gte } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveReminders } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const params = request.nextUrl.searchParams;
  const upcoming = params.get('upcoming');
  const startDate = params.get('start_date');

  const conditions = [eq(driveReminders.userId, user.id)];
  if (upcoming === 'true') {
    conditions.push(eq(driveReminders.isSent, false));
    conditions.push(gte(driveReminders.remindAt, new Date()));
  }
  if (startDate) conditions.push(gte(driveReminders.remindAt, new Date(startDate)));

  const rows = await db
    .select()
    .from(driveReminders)
    .where(and(...conditions))
    .orderBy(desc(driveReminders.remindAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  if (!body.text || !body.remind_at) {
    return NextResponse.json(
      { error: 'Missing required fields: text, remind_at' },
      { status: 400 },
    );
  }

  const [reminder] = await db
    .insert(driveReminders)
    .values({
      recurrenceRule: body.recurrence_rule,
      remindAt: new Date(body.remind_at),
      text: body.text,
      todoId: body.todo_id,
      userId: user.id,
    })
    .returning();

  return NextResponse.json(reminder, { status: 201 });
}
