# Tripz Product Flow Rebuild — Specification

## Objective

Rebuild Tripz around one trustworthy product loop: a visitor discovers a public
route, authenticates only when an action needs an account, clones or creates a
trip, plans it with collaborators, completes it, preserves the memory, and may
share it back to the community. Partner and administrator journeys must support
that loop without exposing privileged actions to ordinary travelers.

## Product decisions fixed by this specification

1. The canonical authenticated home is `/dashboard`; `/trips` remains the
   detailed trip index and `/profile` remains the account owner view.
2. The canonical planner routes are `/planner/new` and `/planner/:id`.
   Existing `/trips/new`, `/trips/:tripId`, and legacy planner aliases must
   redirect without losing the intended destination until the transition ends.
3. A public trip can be `PUBLISHED`, `UNLISTED`, or `PRIVATE`. Private trips
   return `404` to callers who are not members; unlisted trips require their
   share link; published trips are discoverable.
4. Cloning is a server-side command. A signed-in traveler gets a new private
   draft and lands on `/planner/:id`; a guest sees the login gate and returns
   to the original public trip after authentication. A client must never copy
   a route merely by sending trusted owner or source IDs.
5. Product roles are `USER`, `PARTNER`, `MODERATOR`, and `ADMIN`. A partner
   application's `PENDING`, `APPROVED`, `REJECTED` or `SUSPENDED` status is a
   separate business state, not a platform role. Trip-member permissions (`OWNER`, `EDIT`, `VIEW`) are a separate
   concern and never grant platform administration.
6. A user without the Partner role visiting a partner-only route is directed
   to `/partner/register` unless their application is pending, in which case
   they see its status. A non-admin visiting `/admin/**` receives a real 403
   page, not a misleading login redirect or a blank page.
7. Payment, printing, location tracking, uploads, email and notifications are
   real integrations only when their provider flow exists; otherwise the UI
   states that the capability is unavailable and offers a safe next action.

## Required journeys

### 1. Discovery and conversion

- `/` shows only real featured/public trips and editorial content.
- `/explore` supports server-backed search, region, budget, duration and
  transport filters, map/list synchronization, pagination and clear empty,
  loading and provider-error states.
- `/trip/:id` renders route itinerary, public reviews, photos, cost estimate,
  disclosed partner listings/vouchers and public visibility. It is read-only.
- A guest pressing **Clone** sees an accessible login/register gate with a
  safe `next` return. An authenticated traveler presses **Clone** once,
  receives a new draft, and is taken to its planner.
- Saving a trip, liking, reviewing, following and commenting require a session
  and return the traveler to the original resource after login.

### 2. Authentication, session and onboarding

- Email/password registration, confirmation, login, refresh, logout and
  password recovery use Supabase Auth through the Gateway BFF.
- Google sign-in is a separate provider flow, with callback, account-linking
  policy and error states; it is not simulated by a button.
- After normal login the traveler goes to `/dashboard`; a valid safe `next`
  always wins. Login never silently redirects to an unrelated profile page.
- First login collects only a display name and optional travel preferences;
  users can defer nonessential preferences.
- The user can view active sessions, sign out, request account export/deletion,
  and manage notification/privacy preferences. Security-sensitive actions
  require recent authentication where Supabase requires it.

### 3. Dashboard and planning

- `/dashboard` shows the caller's real upcoming/draft/recent trips, invitation
  count, recent memories and relevant community suggestions.
- `/planner/new` creates a private draft after validated origin, destination,
  dates, transport and budget input. It may seed from a clone source.
- `/planner/:id` permits the trip `OWNER` and `EDIT` members to add, remove,
  reorder and move stops; `VIEW` members are read-only. Changes use optimistic
  concurrency and explicit conflict recovery.
- Route preview, place search, budget/cost estimates and smart suggestions
  identify their source and failure state. Drag/drop is only a planner UI for
  persisted stop-order commands.
- Owners invite email recipients as `VIEW` or `EDIT`; recipients can accept or
  decline through a signed invitation. Notification delivery is asynchronous
  and retryable.
- A trip may be shared as private, unlisted or published. Publishing requires
  a complete-enough route and an explicit visibility decision.
- Starting an active trip moves it to `/road/:id`. Desktop shows an honest
  mobile-optimized banner; mobile supports the approved active-trip actions.

### 4. Community and public profiles

- `/community/feed` and `/community/:postId` provide real paginated posts,
  comments, likes, saves, report actions and moderation outcomes.
- `/profile/:username` is a public profile with public trip grid and aggregate
  statistics. `/profile` resolves to the caller's own profile/dashboard view.
- Follow/unfollow, collections and reviews are server-authorized mutations.
  Blocks and deleted/hidden content are consistently excluded from reads.
- Community challenge, share and featured-trip flows must have moderation and
  disclosure rules before exposure.

### 5. On-road, memory and travel book

- `/road/:id` lets eligible trip members check in, optionally share revocable
  live location, view current route context and receive safety/route alerts.
- Location collection requires explicit consent, purpose, retention duration,
  access scope and a stop-sharing control. Exact coordinates are never exposed
  publicly by default.
- Completing a trip creates or queues a Trip Memory. `/memory/:id` displays
  only the owner's/member-visible photos, timeline, expenses and visibility.
- Expenses and split settlements record immutable amounts, payer/payee and
  state. Payment-provider callbacks, not client redirects, settle a payment.
- `/travel-book/:id` is available only for a memory the caller may use;
  `/payment` uses a provider-backed order and idempotent payment flow.

### 6. Partner and administration

- `/partner/register` accepts a business application and required documents,
  records `PENDING`, and provides a status page. It does not grant `PARTNER`
  from browser-controlled input.
- Approved partners use `/partner/dashboard`, `/partner/listings`,
  `/partner/analytics`, `/partner/reviews` and `/partner/billing`. Listing
  creation, publication, budget changes, vouchers and invoice actions are
  authorized server-side and audited.
- `/admin/dashboard`, `/admin/users`, `/admin/partners`, `/admin/content`,
  `/admin/analytics` and `/admin/settings` are protected by explicit
  capabilities. Moderator may moderate content but cannot grant roles, manage
  finance or alter feature flags.
- Partner approval, role changes, moderation decisions, payment adjustments,
  feature-flag changes and exports create immutable audit events.

## Cross-cutting rules

- Every protected URL redirects guests to `/login?next={safeCurrentUrl}`.
- Mutating commands require CSRF protection, runtime validation, authorization,
  correlation IDs and idempotency where retryable.
- Collections paginate; permissions, availability, loading and failure states
  are visible and localized in Vietnamese.
- Supabase Auth remains identity only. Gateway owns BFF cookies and edge policy;
  the owning service authorizes its resources. The Gateway contains no domain
  business logic.
- Public, partner and admin analytics never expose raw PII, precise location or
  payment data beyond the viewer's authorization.

## Explicitly deferred until their own vertical slice

- Offline map download/sync and native mobile background location.
- Real-time group chat, SOS and predictive safety alerts.
- External printing fulfillment, MoMo/ZaloPay settlement and affiliate
  conversion attribution.
- Subscription/group-pass billing and province-level data products.

## Acceptance criteria for the first rebuilt release

1. Guest → public trip → login gate → login → clone → private planner draft
   works end-to-end with one persisted clone record and no duplicate on retry.
2. Owner, editor, viewer, unrelated user and guest each receive the correct
   response for the same private trip, its stops and its invitation links.
3. `/dashboard`, `/planner/new`, `/planner/:id`, `/trip/:id`, `/profile/:username`
   and `/community/feed` render from real data or an explicit empty state.
4. Partner registration and admin approval produce an auditable role change;
   a traveler cannot grant themself any privileged role.
5. Contract, authorization/RLS, migration, service integration and browser E2E
   tests cover all acceptance paths before deployment.
