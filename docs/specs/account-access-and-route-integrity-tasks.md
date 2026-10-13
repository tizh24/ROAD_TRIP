# Tripz Account Access & Route Integrity — Tasks

## 1. Foundation

- [x] Inspect current auth, callback, middleware, profile schema, and route groups.
- [x] Add and review the forward-only profile-role migration.
- [x] Add server-only session/role authorization helpers and focused tests.

## 2. Account access

- [x] Add sign-up validation/action and `/signup` UI with confirmation-aware outcome.
- [x] Add password-recovery request validation/action and `/forgot-password` UI.
- [x] Add password-update validation/action and `/reset-password` UI.
- [x] Connect login/sign-up/recovery pages with safe `next` propagation.

## 3. Route integrity

- [x] Expand middleware protection to all authenticated traveler paths and privileged prefixes.
- [x] Enforce role checks in partner/admin layouts.
- [x] Replace misleading controls or dead navigation in audited route surfaces with real links or clear unavailable states.
- [x] Make profile settings offer only real profile/password controls.

## 4. Quality gate

- [x] Run focused auth/route tests and validate migration syntax/constraints by review. Hosted deployment remains intentionally pending.
- [x] Run lint, typecheck, full tests, and production build.
- [x] Run available browser checks for auth views, unauthenticated redirects, and responsive desktop/mobile layout.
- [ ] Review changed files, audit `git diff --check`, then report limitations and commit only after all checks pass.
