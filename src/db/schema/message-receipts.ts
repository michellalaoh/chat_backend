import {
    pgTable,
    uuid,
    timestamp,
    primaryKey,
    text,
  } from 'drizzle-orm/pg-core';
  
  import { messages } from './messages';
  import { users } from './users';
  
  export const messageReceipts = pgTable(
    'message_receipts',
    {
      messageId: uuid('message_id')
        .references(() => messages.id, { onDelete: 'cascade' })
        .notNull(),
  
      userId: uuid('user_id')
        .references(() => users.id, { onDelete: 'cascade' })
        .notNull(),
  
      status: text('status')
        .$type<'sent' | 'delivered' | 'read'>()
        .notNull()
        .default('sent'),
  
      updatedAt: timestamp('updated_at')
        .defaultNow()
        .notNull(),
    },
    (table) => [
      primaryKey({
        columns: [table.messageId, table.userId],
      }),
    ],
  );