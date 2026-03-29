import { relations } from 'drizzle-orm';
import {
  boolean,
  customType,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

import { createdAt, timestamptz, updatedAt } from './_helpers';

// Custom vector type for pgvector
const vector384 = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(384)';
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
  toDriver(value: number[]): string {
    return `[${value.join(',')}]`;
  },
});

// ==================== Projects ====================

export const driveProjects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: text('status').default('active'),
    color: text('color').default('#6366f1'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [index('idx_projects_user_id').on(table.userId)],
);

export type DriveProject = typeof driveProjects.$inferSelect;
export type NewDriveProject = typeof driveProjects.$inferInsert;

// ==================== Todos ====================

export const driveTodos = pgTable(
  'todos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('open'),
    priority: text('priority').default('medium'),
    dueDate: timestamptz('due_date'),
    projectId: uuid('project_id').references(() => driveProjects.id, { onDelete: 'set null' }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    index('idx_todos_user_id').on(table.userId),
    index('idx_todos_status').on(table.status),
    index('idx_todos_due_date').on(table.dueDate),
    index('idx_todos_project_id').on(table.projectId),
  ],
);

export type DriveTodo = typeof driveTodos.$inferSelect;
export type NewDriveTodo = typeof driveTodos.$inferInsert;

// ==================== Memories ====================

export const driveMemories = pgTable(
  'memories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    content: text('content').notNull(),
    embedding: vector384('embedding'),
    memoryType: text('memory_type').default('general'),
    category: text('category').default('General'),
    sourceConversationId: text('source_conversation_id'),
    isStarred: boolean('is_starred').default(false),
    stalenessDate: timestamptz('staleness_date'),
    createdAt: createdAt(),
  },
  (table) => [
    index('idx_memories_user_id').on(table.userId),
    index('idx_memories_category').on(table.category),
    index('idx_memories_is_starred').on(table.isStarred),
  ],
);

export type DriveMemory = typeof driveMemories.$inferSelect;
export type NewDriveMemory = typeof driveMemories.$inferInsert;

// ==================== Decisions ====================

export const driveDecisions = pgTable(
  'decisions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    projectId: uuid('project_id').references(() => driveProjects.id, { onDelete: 'set null' }),
    content: text('content').notNull(),
    context: text('context'),
    conversationId: text('conversation_id'),
    createdAt: createdAt(),
  },
  (table) => [
    index('idx_decisions_user_id').on(table.userId),
    index('idx_decisions_project_id').on(table.projectId),
  ],
);

export type DriveDecision = typeof driveDecisions.$inferSelect;
export type NewDriveDecision = typeof driveDecisions.$inferInsert;

// ==================== Reminders ====================

export const driveReminders = pgTable(
  'reminders',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    todoId: uuid('todo_id').references(() => driveTodos.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    remindAt: timestamptz('remind_at').notNull(),
    recurrenceRule: text('recurrence_rule'),
    isSent: boolean('is_sent').default(false),
    createdAt: createdAt(),
  },
  (table) => [
    index('idx_reminders_user_id').on(table.userId),
    index('idx_reminders_remind_at').on(table.remindAt),
  ],
);

export type DriveReminder = typeof driveReminders.$inferSelect;
export type NewDriveReminder = typeof driveReminders.$inferInsert;

// ==================== User Profiles ====================

export const driveUserProfiles = pgTable(
  'user_profiles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    assistantName: text('assistant_name').default('Drive'),
    firstUseDate: timestamptz('first_use_date'),
    preferences: jsonb('preferences').$type<Record<string, any>>().default({}),
    onboardingComplete: boolean('onboarding_complete').default(false),
    jokePlayed: boolean('joke_played').default(false),
    pushSubscription: jsonb('push_subscription'),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [uniqueIndex('idx_user_profiles_user_id').on(table.userId)],
);

export type DriveUserProfile = typeof driveUserProfiles.$inferSelect;
export type NewDriveUserProfile = typeof driveUserProfiles.$inferInsert;

// ==================== Relations ====================

export const driveProjectRelations = relations(driveProjects, ({ many }) => ({
  decisions: many(driveDecisions),
  todos: many(driveTodos),
}));

export const driveTodoRelations = relations(driveTodos, ({ many, one }) => ({
  project: one(driveProjects, { fields: [driveTodos.projectId], references: [driveProjects.id] }),
  reminders: many(driveReminders),
}));

export const driveDecisionRelations = relations(driveDecisions, ({ one }) => ({
  project: one(driveProjects, {
    fields: [driveDecisions.projectId],
    references: [driveProjects.id],
  }),
}));

export const driveReminderRelations = relations(driveReminders, ({ one }) => ({
  todo: one(driveTodos, { fields: [driveReminders.todoId], references: [driveTodos.id] }),
}));
