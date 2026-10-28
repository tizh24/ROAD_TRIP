# CI/CD Pipeline Optimization Plan

## CI topology

Replace the combined integration job with independent jobs after change
detection:

1. `backend-quality` and `web-quality` remain parallel and cached.
2. `database-validation` starts Supabase, applies clean migrations, and runs
   pgTAP/RLS checks before any generated E2E fixture exists.
3. `service-e2e` is a matrix for API Gateway, Core Trip, Geo Location, and
   Notification Worker. Each entry has its own five-minute test timeout,
   bounded startup/cleanup, and Docker diagnostics.
4. `web-e2e` owns Supabase, the platform stack, fixture creation, and
   Playwright. It uploads Playwright reports/traces on failure.
5. A required aggregate gate depends on all applicable jobs and rejects
   incomplete, cancelled, or failed validation.

Use pnpm/npm cache, Playwright browser cache, Docker Buildx cache, and bounded
registry retries. No job may have a single unstructured 25-minute command.

## CD topology

- On `dev`, build/publish validated immutable GHCR images, deploy to staging,
  then run the existing read-only staging smoke check.
- On `main`, build/publish immutable GHCR images, deploy to production, then
  run production smoke checks.
- Deployment uses GitHub Environments (`staging`, `production`) and only
  environment-scoped secrets; workflow logs never print them.

## Required external configuration

The repository currently has image publishing but no deployment command,
destination, public environment URL, or deployment credentials. Before CD can
be implemented, configure a staging and production target plus the associated
GitHub Environment secrets. The CI refactor is independent of those values.

## Verification

- Exercise changed-server, changed-web, and documentation-only PR paths.
- Confirm one timed-out service E2E matrix entry fails quickly with artifacts.
- Confirm fixture data cannot affect database/RLS validation.
- Confirm deployment runs only from `dev`/`main` and smoke checks the deployed
  immutable revision.
