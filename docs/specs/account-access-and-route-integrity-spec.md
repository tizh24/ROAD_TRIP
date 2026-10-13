# Tripz Account Access & Route Integrity — Specification

## Objective

Make every currently exposed Tripz route honest and safely accessible: a visitor can create an account, recover access, and reach only the areas appropriate to their identity and product role. Routes that do not yet have a real data-backed workflow must communicate that fact rather than look like completed product functionality.

## User outcomes

1. A new traveler can register with their name, email, and a secure password, then receives a clear confirmation state appropriate to the Supabase project configuration.
2. A traveler who cannot sign in can request a password-reset email without learning whether an email address is registered.
3. A traveler who follows an expired or valid recovery link can set a new password and sign in again.
4. Authenticated traveler routes require a session and return the visitor to the intended destination after sign-in.
5. Partner and administrator routes require both a session and the matching role. A regular traveler cannot access either area by directly entering its URL.
6. Existing user profiles have a stable application role of `USER`, `PARTNER`, or `ADMIN`; registration always creates a `USER`. A user cannot elevate their own role through a browser request.
7. Profile settings exposes only the account controls that are actually connected in this release (display name and password). Billing remains an honest no-payment state.
8. Planner aliases, public route pages, feed, memories, partner, and admin surfaces do not present non-functional controls as completed workflows. They either link to a real destination or clearly state the capability is not available yet.

## Scope

- Add `/signup`, `/forgot-password`, and `/reset-password` routes plus their accessible Vietnamese forms and completion/error states.
- Extend the existing Supabase Auth server actions for sign-up, recovery-email dispatch, password update, and profile-name update.
- Add a forward-only migration that stores the application role on `public.user_profiles`, defaults new and existing profiles to `USER`, and prevents direct client-side role mutation.
- Protect all authenticated traveler pages and all partner/admin route groups in middleware.
- Enforce partner/admin authorization in their server layouts, even if a request bypasses middleware.
- Repair route-level links and labels where a control currently implies persistence or a destination that does not exist.
- Add focused automated tests for path protection, auth input validation, and role/profile security decisions.

## Explicit non-goals

- Creating actual partner or administrator business workflows, analytics, payments, social feed persistence, public-trip cloning, or memory persistence. Those need owned backend services and separate vertical slices.
- Assigning privileged roles through a public page, seed, client request, or user-controlled metadata.
- Changing the Trip, invitation, or route-planning APIs.
- Adding an identity provider other than existing Supabase Auth.

## Behavior and safety requirements

- All user-facing copy is Vietnamese and all form controls have visible labels, keyboard focus, validation feedback, and 44px minimum touch targets.
- Auth redirects only accept safe internal paths; recovery redirects always return to Tripz's reset-password route.
- Registration and recovery failures use safe, non-enumerating messages. Passwords are never logged or returned.
- A successful registration must not manufacture a session when email confirmation is enabled. It instead instructs the traveler to check their inbox. If confirmation is disabled and Supabase creates a session, the traveler continues to their safe `next` destination.
- Password recovery success uses the same neutral confirmation regardless of account existence.
- Server-side authorization is authoritative. Route middleware is an early redirect convenience, not the sole role check.
- Every profile role starts as `USER`; transition to `PARTNER` or `ADMIN` occurs only through an operational database process outside public application access.
- Unavailable route capabilities must say they are unavailable and must not expose a primary action that suggests a mutation will occur.

## Acceptance criteria

- `/signup`, `/forgot-password`, and `/reset-password` render without unauthenticated redirect loops and work with the existing Supabase configuration.
- Invalid input, Supabase errors, confirmation-required registration, reset-email submission, invalid recovery session, and successful password reset each have clear Vietnamese feedback.
- `/trips`, `/trip-invitations`, `/planner`, `/profile`, `/memory`, `/feed`, `/profile/settings`, and `/profile/billing` redirect unauthenticated visitors to `/login?next=...`.
- `/partner/**` and `/admin/**` redirect unauthenticated visitors to login; signed-in users without the appropriate role receive a safe access-denied response and cannot view portal content.
- `public.user_profiles.role` exists with a valid default/check constraint, existing rows are backfilled, and an authenticated profile owner cannot update that column.
- Login and sign-up provide reciprocal links and preserve a validated `next` destination.
- Relevant new and changed code passes lint, strict type checking, build, and focused tests. The migration is validated against the configured Supabase project before it is recorded as deployed.
