# Tripz Product Flow Rebuild — Implementation Plan

## Current-state audit

| Area | Existing capability | Gap to target |
| --- | --- | --- |
| Identity | Supabase Auth via Gateway BFF; cookie session; USER/PARTNER/ADMIN | social login, onboarding, account lifecycle, granular roles |
| Trips | authenticated create/list/detail/update/stops/invitations | public publication, clone, templates, visibility, dashboard/read models |
| Geo | place search and route preview adapters | map/list query model, filters, route persistence and cost estimate |
| Community | route shells only | owned service, data model, public profiles, reactions, moderation |
| Memory/on-road | route shells only | consented tracking, check-ins, expenses, memories, books |
| Partner/admin | guarded UI shells only | application/approval, listings, capability RBAC, audit trails |
| Monetization | service skeleton | orders, payment webhooks, vouchers, invoice/budget ledger |
| Notifications | worker shell plus trip outbox basis | templates, delivery records, email/push/in-app adapters |

## Architecture decisions

1. **Keep the active 5+1 architecture.** Gateway is BFF and policy edge;
   Core Trip owns trips, trip members, publication, clone and memory/expense
   foundations. Geo owns provider calls and geographic read models. Social owns
   profiles/community. Monetization owns partner commercial records, orders and
   payments. Notification worker owns delivery only.
2. **Build vertical slices, not 72 empty tables.** A migration is introduced
   only with the slice that persists and tests it. Existing migrations remain
   immutable.
3. **Canonical routes move by compatibility redirects.** Add `/dashboard` and
   `/planner/new`; old `/trips` paths remain links/redirects during migration.
   No duplicate client state or two independent planner APIs.
4. **Use capability authorization.** Platform roles become USER, PARTNER,
   MODERATOR and ADMIN; a separate partner-application state records pending
   and rejected applications. Server-side capability checks
   express permissions such as `partner.listing.write` and `admin.role.grant`.
   Trip membership remains separate.
5. **Public reads are read models.** Public discovery cannot expose private
   aggregate internals. Publish/unpublish emits events to build/search public
   read models, while the Core Trip aggregate remains authoritative.
6. **Provider adapters remain replaceable.** Supabase, VietMap, storage,
   OAuth, email, payment and print providers are behind ports with timeouts,
   redaction, retry semantics and tests.

## Route and ownership map

| Route group | Owner | Auth rule | First delivery |
| --- | --- | --- | --- |
| `/`, `/explore`, `/trip/:id` | Social public read + Core Trip | public; private trip 404 | Slice 1 |
| `/dashboard`, `/planner/**`, `/road/**`, `/memory/**` | Core Trip + Geo | session + trip membership | Slices 1–3 |
| `/community/**`, `/profile/:username`, collections | Social Community | public read / session mutation | Slice 4 |
| `/partner/**` | Monetization | partner capability | Slice 5 |
| `/admin/**` | service-specific admin commands | capability; 403 | Slice 5 |
| `/travel-book/**`, `/payment` | Monetization + Core Trip | owner/member and order authorization | Slice 6 |

## Delivery slices

### Slice 0 — Route contract and authorization foundation

- Define capability matrix, route transition table and stable error semantics.
- Add forward-only role migration, role-transition audit records and test-only
  seeded identities. Do not use production accounts as fixtures.
- Add 401/403/404 pages and robust `next` behavior. Keep the existing BFF
  cookie model.
- Define OpenAPI contracts for every first-slice endpoint before implementation.

### Slice 1 — Public discovery to clone to planner (MVP walking skeleton)

- Core Trip: trip visibility, published template/read model, clone provenance,
  clone command with idempotency, draft creation and authorization.
- Geo: filtered public route query and map marker projection backed by actual
  published route data.
- Web: landing, explore, public trip, login gate, `/dashboard`, `/planner/new`
  and `/planner/:id` route transition. Existing `/trips/**` becomes compatible
  navigation until removed deliberately.
- Events: `TripPublished`, `TripCloned`, `TripCreated`; outbox and idempotent
  consumer where public read model is asynchronous.
- Test the exact guest-to-clone and owner/editor/viewer matrix end-to-end.

### Slice 2 — Collaborative planning and invitations

- Complete stop ordering/moving, optimistic concurrency conflicts, invite
  lifecycle and email/in-app delivery records.
- Add private/unlisted/public share policy and member audit trail.
- Implement public/mobile-desktop behavior for `/road/:id` as an honest
  desktop handoff; do not claim live tracking until Slice 3.

### Slice 3 — Active trip and Trip Memory foundation

- Add consent/revocation-based check-in and limited location model, retention
  job, trip completion state, photo upload validation and memory read model.
- Add expenses and split calculation with no payment settlement yet.
- Deliver memory visibility and share-to-community request flow.

### Slice 4 — Community and profile vertical slice

- Social schema/API: public profiles, follows, collections, posts, comments,
  reactions, reports and moderation queue.
- Consume approved public-trip/memory events; never directly mutate Core Trip
  tables from Social.
- Add pagination, block/report policy and moderator capabilities.

### Slice 5 — Partner onboarding and operations

- Monetization schema/API: applications, documents, partner status, listings,
  voucher disclosure, campaign budget ledger and review replies.
- Admin approval/rejection, role transition, listing moderation and immutable
  audit log. Split moderator and administrator authority.
- Partner/admin dashboards use real aggregate read models, not placeholder KPIs.

### Slice 6 — Payments and travel books

- Order/invoice/payment state machine, signed webhook adapter, replay defense
  and reconciliation dashboard.
- Travel book draft/order needs a print-provider adapter and explicit delivery
  status. Implement MoMo/ZaloPay only after provider contracts and webhook test
  environments are available.

## Data and event plan

- Extend `trip_schema` first: visibility/publication, clone provenance, template
  reference and audit-safe share token representation. Avoid storing raw tokens.
- Introduce `social_schema`, `monetization_schema` and `notification_schema`
  only alongside their owning service slice, each with a least-privilege role.
- Use transactional outbox for published, cloned, invited, completed, approved,
  paid and moderated facts. Consumers are versioned and idempotent.
- Add an explicit retention/deletion plan before photos, exact coordinates,
  partner documents or payment data are written.

## Verification and rollout

- Per slice: SQL migration tests, domain tests, service integration tests,
  Gateway contract tests, RLS/authorization matrix tests and browser E2E.
- Critical E2E suite covers guest, USER, viewer, editor, owner, pending partner,
  partner, moderator and admin.
- Stage each migration against a managed Supabase staging project; use hosted
  Redis/BullMQ and native processes locally, with Docker only as an optional
  reproducible integration profile.
- Publish OpenAPI from the Gateway, generate/validate client contracts, and run
  `typecheck`, tests, build, migration status and `git diff --check` before
  each release.
