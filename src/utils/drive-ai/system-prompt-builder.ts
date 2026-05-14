import { and, desc, eq } from 'drizzle-orm';

import { driveMemories, driveReminders, driveTodos, driveUserProfiles } from '@/database/schemas';

import { db } from './db';

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

  return parts.join('\n');
}
