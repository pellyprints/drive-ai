import { and, eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveReminders } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, any> = {};
  if (body.is_sent !== undefined) updates.isSent = body.is_sent;
  if (body.remind_at !== undefined) updates.remindAt = new Date(body.remind_at);
  if (body.text !== undefined) updates.text = body.text;
  if (body.recurrence_rule !== undefined) updates.recurrenceRule = body.recurrence_rule;

  const [reminder] = await db
    .update(driveReminders)
    .set(updates)
    .where(and(eq(driveReminders.id, id), eq(driveReminders.userId, user.id)))
    .returning();

  if (!reminder) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(reminder);
}
