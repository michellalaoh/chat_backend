import {
    pgTable,
    uuid,
    timestamp,
    text,
  } from 'drizzle-orm/pg-core';
  
  export const conversations = pgTable('conversations', {
    id: uuid('id').defaultRandom().primaryKey(),
  
    type: text('type').notNull(), 
    // 'direct' | 'group'
  
    title: text('title'), // group name (nullable)
  
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),
  });