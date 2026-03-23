import {
    pgTable,
    uuid,
    text,
    timestamp,
    boolean,
  } from 'drizzle-orm/pg-core';
  
  export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
  
    email: text('email').unique().notNull(),
  
    username: text('username').unique(),
  
    displayName: text('display_name'),
  
    avatarUrl: text('avatar_url'),
  
    isOnline: boolean('is_online')
      .default(false)
      .notNull(),
  
    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

    password: text('password').notNull(),
  });