# Authentication — Agent Instructions

Guidelines for all authentication work in this project using Clerk (`@clerk/nextjs`).

> **Rule:** Clerk is the **only** authentication method permitted in this project. Never implement custom auth, NextAuth, Lucia, or any other auth library.

---

## Provider Setup

`ClerkProvider` is mounted once in `app/layout.tsx` and wraps the entire application. Do not add it anywhere else.

---

## Protecting Routes

### Server Components & Server Actions

Use `auth()` from `@clerk/nextjs/server` to get the current session server-side:

```ts
import { auth } from '@clerk/nextjs/server';

export default async function ProtectedPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // safe to query database here
}
```

- Call `auth()` at the top of every Server Component or server action that requires an authenticated user.
- Use `redirect()` from `next/navigation` to send unauthenticated users away — never render protected content conditionally on the client.
- Never rely on client-side Clerk hooks as the sole authorization check for sensitive data.

### Middleware (Route-Level Protection)

Use `clerkMiddleware` in `middleware.ts` for broad route protection:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/r(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?2|tst?|css|webp|png|jpeg|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
```

- Define public routes explicitly — default to private.
- The short-link redirect route (e.g. `/r/[slug]`) must be public so unauthenticated users can follow links.
---

## Route Rules

### `/dashboard` — Protected

`/dashboard` requires the user to be authenticated. Enforce this at the middleware level via `auth.protect()`. Do **not** render the page and conditionally hide content — redirect unauthenticated users away entirely.

### `/` (Homepage) — Redirect Authenticated Users

If a signed-in user visits the homepage (`/`), redirect them to `/dashboard`:

```ts
// In app/page.tsx (Server Component)
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  // render public homepage
}
```
---

## Reading the Current User

### In Server Components

```ts
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();
```

### In Client Components

```tsx
'use client';
import { useUser } from '@clerk/nextjs';

export function ProfileBadge() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  return <span>{user?.firstName}</span>;
}
```

- Prefer reading user data server-side where possible to avoid client-side loading states.

---

## UI Components

Use Clerk's pre-built components for auth flows — do not build custom sign-in/sign-up forms.

**Sign-in and sign-up must always open as a modal** — never navigate to a dedicated `/sign-in` or `/sign-up` page. Pass `mode="modal"` to `SignInButton` and `SignUpButton`:

```tsx
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

// Show sign-in/up buttons only to guests
<SignedOut>
  <SignInButton mode="modal"><Button variant="outline">Sign In</Button></SignInButton>
  <SignUpButton mode="modal"><Button>Sign Up</Button></SignUpButton>
</SignedOut>

// Show user avatar/menu only to authenticated users
<SignedIn>
  <UserButton />
</SignedIn>
```

---

## Environment Variables

| Variable                          | Description                        |
| --------------------------------- | ---------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key (safe for client) |
| `CLERK_SECRET_KEY`                | Secret key — server-side only      |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL`   | Optional custom sign-in path       |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL`   | Optional custom sign-up path       |

- `CLERK_SECRET_KEY` must never be imported in a Client Component or exposed in any response.

---

## Security Rules

- Always validate `userId` server-side before performing any database mutation.
- When storing Clerk's `userId` in the database, use the `userId` string returned by `auth()` directly — do not transform or hash it.
- Do not cache auth state across requests; call `auth()` fresh in each server action or page.
