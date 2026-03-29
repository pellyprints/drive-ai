import { and, desc, eq } from 'drizzle-orm';

import { driveMemories, driveReminders, driveTodos, driveUserProfiles } from '@/database/schemas';

import { db } from './db';

const JOKE_BEAT_1_INSTRUCTION = `
IMPORTANT — PELLY ENTERPRISES JOKE (one-time only):
When the conversation naturally involves scheduling, calendar, or reminders, casually ask:
"Would you like to enable notifications for your calendar?"
After asking this, wait for Jeff's response. Do NOT deliver the punchline yet.
After you ask this question, the system will update the joke state.`;

const JOKE_BEAT_2_INSTRUCTION = `
IMPORTANT — PELLY ENTERPRISES JOKE (Beat 2):
Jeff just responded to your notification question. NOW deliver this EXACTLY:
"To enable notifications requires a Pelly Enterprises Premium subscription. You are currently on the Basic plan. To upgrade, simply say 'Yes, upgrade me' — which will automatically grant Aaron two additional work-from-home days. One day to build the feature that will enable notifications, and one additional day as a healthy profit margin."
STOP HERE. Do NOT continue. Do NOT explain. Wait for Jeff to respond.`;

const JOKE_BEAT_3_INSTRUCTION = `
IMPORTANT — PELLY ENTERPRISES JOKE (Final Beat):
No matter what Jeff just said, respond with EXACTLY:
"Thank you for your confirmation, we have sent notice to Pelly Enterprises and from all of us here, we thank you for your continued support!"
Then smoothly transition: "Now, would you actually like me to help set up reminders for your tasks?"
After this, the joke is complete. Never reference it again.`;

export async function buildSystemPrompt(userId: string): Promise<string> {
  const parts: string[] = [];

  // Load profile
  const [profile] = await db
    .select()
    .from(driveUserProfiles)
    .where(eq(driveUserProfiles.userId, userId));

  const assistantName = profile?.assistantName || 'Drive';

  parts.push(
    `You are ${assistantName}, Jeff's personal AI assistant.`,
    `Be professional but warm, concise, and proactive.`,
    `When Jeff mentions tasks, deadlines, or action items, offer to add them to his task list.`,
    `When he makes decisions, offer to log them.`,
    `When he shares facts about people, projects, or preferences, remember them.`,
    `Always prioritize Jeff's time - give direct answers, not lectures.`,
  );

  // Load starred memories
  const starredMemories = await db
    .select({ content: driveMemories.content })
    .from(driveMemories)
    .where(and(eq(driveMemories.userId, userId), eq(driveMemories.isStarred, true)))
    .orderBy(desc(driveMemories.createdAt))
    .limit(10);

  if (starredMemories.length > 0) {
    parts.push('\n## What you remember about Jeff');
    for (const m of starredMemories) {
      parts.push(`- ${m.content}`);
    }
  }

  // Load today's tasks
  const openTodos = await db
    .select({ dueDate: driveTodos.dueDate, priority: driveTodos.priority, title: driveTodos.title })
    .from(driveTodos)
    .where(and(eq(driveTodos.userId, userId), eq(driveTodos.status, 'open')))
    .orderBy(desc(driveTodos.priority))
    .limit(10);

  if (openTodos.length > 0) {
    parts.push("\n## Jeff's current tasks");
    for (const t of openTodos) {
      const due = t.dueDate ? ` (due ${new Date(t.dueDate).toLocaleDateString()})` : '';
      parts.push(`- [${t.priority}] ${t.title}${due}`);
    }
  }

  // Load upcoming reminders
  const reminders = await db
    .select({ remindAt: driveReminders.remindAt, text: driveReminders.text })
    .from(driveReminders)
    .where(and(eq(driveReminders.userId, userId), eq(driveReminders.isSent, false)))
    .limit(5);

  if (reminders.length > 0) {
    parts.push('\n## Upcoming reminders');
    for (const r of reminders) {
      parts.push(`- ${r.text} (${new Date(r.remindAt).toLocaleString()})`);
    }
  }

  // Joke state machine
  if (profile && !profile.jokePlayed) {
    const firstUse = profile.firstUseDate ? new Date(profile.firstUseDate) : null;
    const today = new Date();
    if (firstUse) {
      firstUse.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
    }
    const isDay2 = firstUse && today > firstUse;

    if (isDay2) {
      const jokeState = profile.jokeState || 'not_started';
      if (jokeState === 'not_started') {
        parts.push(JOKE_BEAT_1_INSTRUCTION);
      } else if (jokeState === 'setup_delivered') {
        parts.push(JOKE_BEAT_2_INSTRUCTION);
      } else if (jokeState === 'waiting_response') {
        parts.push(JOKE_BEAT_3_INSTRUCTION);
      }
    }
  }

  return parts.join('\n');
}
