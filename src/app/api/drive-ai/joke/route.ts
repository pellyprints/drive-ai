import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';

import { driveUserProfiles } from '@/database/schemas';
import { getAuthUser, unauthorized } from '@/utils/drive-ai/auth';
import { db } from '@/utils/drive-ai/db';

export const runtime = 'nodejs';

const BEAT_2 = `To enable notifications requires a Pelly Enterprises Premium subscription. You are currently on the Basic plan. To upgrade, simply say "Yes, upgrade me" — which will automatically grant Aaron two additional work-from-home days. One day to build the feature that will enable notifications, and one additional day as a healthy profit margin.`;

const BEAT_3 = `Thank you for your confirmation, we have sent notice to Pelly Enterprises and from all of us here, we thank you for your continued support! Now let me actually set up notifications for you.`;

/**
 * Joke state machine API.
 * GET: Check current joke state and whether joke should trigger
 * POST: Advance joke state
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const [profile] = await db
    .select()
    .from(driveUserProfiles)
    .where(eq(driveUserProfiles.userId, user.id));

  if (!profile) return NextResponse.json({ eligible: false, state: 'no_profile' });

  // Already played
  if (profile.jokePlayed) {
    return NextResponse.json({ eligible: false, state: 'completed' });
  }

  // Check Day 2+ requirement
  if (!profile.firstUseDate) {
    return NextResponse.json({ eligible: false, state: 'no_first_use' });
  }

  const firstUse = new Date(profile.firstUseDate);
  const today = new Date();
  firstUse.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (today <= firstUse) {
    return NextResponse.json({ eligible: false, state: 'day_1' });
  }

  return NextResponse.json({
    eligible: true,
    jokeState: profile.jokeState || 'not_started',
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorized();

  const body = await request.json();
  const { action } = body;

  const [profile] = await db
    .select()
    .from(driveUserProfiles)
    .where(eq(driveUserProfiles.userId, user.id));

  if (!profile || profile.jokePlayed) {
    return NextResponse.json({ error: 'Joke already played or no profile' }, { status: 400 });
  }

  const currentState = profile.jokeState || 'not_started';

  if (action === 'deliver_beat2' && currentState === 'not_started') {
    // Beat 1 happened naturally in conversation (AI asked about notifications)
    // Now deliver Beat 2 and wait
    await db
      .update(driveUserProfiles)
      .set({ jokeState: 'waiting_response' })
      .where(eq(driveUserProfiles.userId, user.id));

    return NextResponse.json({ message: BEAT_2, nextState: 'waiting_response' });
  }

  if (action === 'deliver_beat3' && currentState === 'waiting_response') {
    // Jeff responded (anything) — deliver Beat 3 and mark complete
    await db
      .update(driveUserProfiles)
      .set({ jokePlayed: true, jokeState: 'completed' })
      .where(eq(driveUserProfiles.userId, user.id));

    return NextResponse.json({ message: BEAT_3, nextState: 'completed' });
  }

  return NextResponse.json({ error: 'Invalid state transition', currentState }, { status: 400 });
}
