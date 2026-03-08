# API & Server Actions — Agent Instructions

Guidelines for all server-side logic in this project: Server Actions and Route Handlers.

---

## Prefer Server Actions Over Route Handlers

Use **Server Actions** for all form mutations and user-initiated writes. Only reach for a Route Handler when:

- A third-party service requires a webhook endpoint.
- You need to return a non-JSON response (e.g. a redirect for a short-link hit).
- The client must call the endpoint with `fetch` from outside a React tree.

---

## Server Actions

### File Placement

- **Co-locate** a server action with the page that uses it: define it in the same `page.tsx` or in a sibling `actions.ts` file.
- If an action is shared across multiple routes, place it in `app/actions.ts`.

### Shape

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { db } from '@/db/index';
import { shortLinks } from '@/db/schema';

export async function createShortLink(formData: FormData): Promise<void> {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const url = formData.get('url');
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('A valid URL is required.');
  }

  // ... insert into db
}
```

- Mark the file or individual function with `'use server'`.
- Always call `auth()` at the top and guard against unauthenticated calls.
- Validate all inputs before touching the database.
- Return `void` or a typed result object — never return raw database rows to the client.
- Throw `Error` with a user-friendly message for expected failures; let unexpected errors propagate.

### Input Validation

Validate at the server boundary every time:

```ts
const url = formData.get('url');
if (typeof url !== 'string' || !URL.canParse(url)) {
  throw new Error('Please enter a valid URL.');
}
```

- Use `URL.canParse()` (Node 19+) or `new URL()` inside a try/catch to validate URLs.
- Strip and sanitise string inputs with `.trim()` before storing.
- Reject unexpected shapes early — do not rely on database constraints as the first line of defence.

---

## Route Handlers

Place route handlers in `app/api/<path>/route.ts`.

### Short-Link Redirect

The redirect route is the one exception where a Route Handler is appropriate — it must be publicly accessible and return an HTTP redirect:

```ts
// app/r/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { shortLinks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  const [link] = await db
    .select()
    .from(shortLinks)
    .where(eq(shortLinks.slug, slug))
    .limit(1);

  if (!link) {
    return NextResponse.redirect(new URL('/', _req.url));
  }

  return NextResponse.redirect(link.url, { status: 301 });
}
```

- Always validate the `slug` param before querying the database.
- Return a `404`-equivalent redirect (to home or a not-found page) when no matching link is found.
- Use `301` for permanent redirects on short links; use `302` for temporary ones.

---

## Error Handling

- Catch database errors in server actions and re-throw with a generic message:

```ts
try {
  await db.insert(shortLinks).values({ url, slug, userId });
} catch {
  throw new Error('Could not create short link. Please try again.');
}
```

- Never send stack traces or raw SQL errors to the client.
- Log errors server-side (structured logging preferred) — do not use `console.log` in committed code.

---

## Security Checklist

- Authenticate before every mutation (`auth()` at the top of every action).
- Scope database queries to the current user's `userId` — never trust client-supplied IDs for ownership.
- Validate and sanitise all user-supplied strings before use as query values or URL targets.
- Guard against open redirects: when redirecting to a user-supplied URL, ensure it is an absolute URL with an `http` or `https` scheme.
