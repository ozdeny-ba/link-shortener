import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const shortLinks = pgTable('short_links', {
  id:        integer('id').generatedAlwaysAsIdentity().primaryKey(),
  url:       text('url').notNull(),
  slug:      text('slug').notNull().unique(),
  userId:    text('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().$onUpdateFn(() => new Date()),
});

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;
