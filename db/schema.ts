import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(), hostHash: text('host_hash').notNull(),
  slide: integer('slide').notNull().default(0), pollOpen: integer('poll_open').notNull().default(1),
  blackout: integer('blackout').notNull().default(0), revision: integer('revision').notNull().default(0),
  createdAt: integer('created_at').notNull(), expiresAt: integer('expires_at').notNull(),
});
export const responses = sqliteTable('responses', {
  id: text('id').primaryKey(), room: text('room').notNull().references(() => sessions.id),
  participant: text('participant').notNull(), selections: text('selections').notNull(),
  experience: text('experience').notNull(), createdAt: integer('created_at').notNull(),
}, t => [uniqueIndex('responses_room_participant').on(t.room,t.participant), index('responses_room_created').on(t.room,t.createdAt)]);
