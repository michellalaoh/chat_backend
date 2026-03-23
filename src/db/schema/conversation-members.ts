import {
    pgTable,
    uuid,
    timestamp,
    primaryKey,
  } from 'drizzle-orm/pg-core';
  
  import { conversations } from './conversations';
  import { users } from './users';
  
  export const conversationMembers = pgTable(
    'conversation_members',
    {
      conversationId: uuid('conversation_id')
        .references(() => conversations.id, { onDelete: 'cascade' })
        .notNull(),
  
      userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
  
      joinedAt: timestamp('joined_at')
        .defaultNow()
        .notNull(),
    },
    (table) => [
      primaryKey({
        columns: [table.conversationId, table.userId],
      }),
    ],
  );