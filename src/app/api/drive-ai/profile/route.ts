import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveUserProfiles } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  // Upsert: get existing or create with defaults
  const [existing] = await db
    .select()
    .from(driveUserProfiles)
    .where(eq(driveUserProfiles.userId, user.id));

  if (existing) return NextResponse.json(existing);

  // First access — create profile with first_use_date
  const [profile] = await db
    .insert(driveUserProfiles)
    .values({
      firstUseDate: new Date(),
      userId: user.id,
    })
    .returning();

  return NextResponse.json(profile, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const updates: Record<string, any> = {};

  // Allowed mutable fields
  if (body.assistant_name !== undefined) updates.assistantName = body.assistant_name;
  if (body.preferences !== undefined) updates.preferences = body.preferences;
  if (body.onboarding_complete !== undefined) updates.onboardingComplete = body.onboarding_complete;
  if (body.push_subscription !== undefined) updates.pushSubscription = body.push_subscription;

  // joke_played can only go false -> true, never back
  if (body.joke_played === true) updates.jokePlayed = true;

  // joke_state: not_started -> setup_delivered -> waiting_response -> completed
  if (body.joke_state !== undefined) updates.jokeState = body.joke_state;

  // calendar_unlocked_seen: set true when Day 2 unlock announcement is shown
  if (body.calendar_unlocked_seen === true) updates.calendarUnlockedSeen = true;

  // first_use_date is IMMUTABLE — ignore if provided

  const [profile] = await db
    .update(driveUserProfiles)
    .set(updates)
    .where(eq(driveUserProfiles.userId, user.id))
    .returning();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  return NextResponse.json(profile);
}
