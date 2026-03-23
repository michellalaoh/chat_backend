import {
  pgTable,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { conversations } from './conversations';

export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),

  conversationId: uuid('conversation_id')
    .references(() => conversations.id)
    .notNull(),

  senderId: uuid('sender_id')
    .references(() => users.id)
    .notNull(),

  content: text('content').notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
});