# Database — Agent Instructions

Guidelines for all database work in this project using Drizzle ORM and Neon PostgreSQL.

---

## Client Singleton

The Drizzle client is initialised once in `db/index.ts` using the Neon HTTP adapter:

```ts
import { drizzle } from 'drizzle-orm/neon-http';

const db = drizzle(process.env.DATABASE_URL!);

export { db };
```

- **Always** import `db` from `@/db/index.ts` — never create a second client.
- `DATABASE_URL` is required at runtime; the `!` assertion is intentional.

---

## Schema

All table definitions live in `db/schema.ts`. Do not split schema across multiple files.

### Conventions

- Use `pgTable` from `drizzle-orm/pg-core` for every table.
- Name tables in **snake_case** plural (e.g. `short_links`, `users`).
- Every table must have a primary key. Prefer `serial` or `uuid` with `defaultRandom()`.
- Use `text` for string columns unless a bounded length is meaningful — avoid `varchar` with arbitrary limits.
- Add `notNull()` to every column that must always have a value.
- Timestamps: use `timestamp` with `defaultNow()` for `created_at`; include `updated_at` using `.$onUpdateFn(() => new Date())` for mutable tables.
- Export the inferred `type` alongside each table:

```ts
import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const shortLinks = pgTable('short_links', {
  id:        serial('id').primaryKey(),
  url:       text('url').notNull(),
  slug:      text('slug').notNull().unique(),
  userId:    text('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ShortLink = typeof shortLinks.$inferSelect;
export type NewShortLink = typeof shortLinks.$inferInsert;
```

---

## Querying

Use the Drizzle query builder — never write raw SQL strings unless there is no builder equivalent.

```ts
import { db } from '@/db/index';
import { shortLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Select
const link = await db
  .select()
  .from(shortLinks)
  .where(eq(shortLinks.slug, slug))
  .limit(1);

// Insert
await db.insert(shortLinks).values({ url, slug, userId });

// Delete
await db.delete(shortLinks).where(eq(shortLinks.id, id));
```

- Wrap multi-step mutations in a transaction: `await db.transaction(async (tx) => { ... })`.
- Always `await` every query — never fire-and-forget.
- Validate that query results are non-empty before using them; do not assume a record exists.

---

## Migrations

Use **Drizzle Kit** for all schema changes. Never alter the live database manually.

```bash
# Generate a new migration from schema changes
npx drizzle-kit generate

# Apply pending migrations
npx drizzle-kit migrate
```

- Migration files are output to `./drizzle/` (configured in `drizzle.config.ts`).
- Commit migration files alongside the schema change in the same commit.
- Never edit generated migration files by hand.

---

## Security

- Never pass user-supplied values directly into raw query strings.
- Scope every query to the authenticated user's `userId` where applicable — never return another user's data.
- Do not expose database error messages to the client; catch errors server-side and return a generic message.
