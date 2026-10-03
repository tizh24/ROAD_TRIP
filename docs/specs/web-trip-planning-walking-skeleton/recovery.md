# T064 Recovery runbook

## Database backup and restore

Never run a restore against the active Supabase staging project. Create a new,
isolated PostgreSQL target first. Before a migration release, take a provider
backup and record its timestamp and migration head. To rehearse recovery:

1. Restore the backup to an isolated database.
2. Verify migration history and application-critical tables.
3. Run read-only health and authenticated trip-list checks against the restored
   target before considering a production restore.

**Evidence, 2026-10-04:** a disposable PostgreSQL 16 container created a probe
row, produced a custom `pg_dump`, restored it into a separate database, and
verified the exact probe row. The disposable container was removed afterward.

## Application rollback

Do not roll back database migrations by editing applied SQL. Roll back only the
application image to the previous release commit after confirming that commit
supports the current migration head. Keep migrations additive and backward
compatible for at least one release. Verify Gateway and Core readiness, then
run authenticated read-only trip and geo requests. If compatibility fails,
roll forward with a corrective migration instead.

## BullMQ failed jobs

Inspect failed jobs with the protected development Bull Board profile or a
queue script. Record job ID, event ID, attempts and failure class without
copying payloads or credentials into tickets. Fix the cause first. Replay only
retryable jobs; terminal schema failures remain failed. Notification delivery is
idempotent through `notification_schema.processed_events`, so replaying a
previously delivered event must not create a second delivery.

**Evidence, 2026-10-04:** the isolated `roadtrip:recovery` queue created a
controlled failed job, inspected it through `getFailed`, replayed the same job,
and observed completion on its second attempt. `pnpm verify:bullmq-replay`
repeats this rehearsal and clears only that isolated queue.

## Provider outage

LocationIQ failure returns `PLACE_PROVIDER_UNAVAILABLE` or `ROUTE_UNAVAILABLE`.
The Geo adapter makes one transient retry, then opens its circuit after three
consecutive failures for 30 seconds. Cached results continue to serve. Keep
saved trip data intact, show the retryable state in the web UI, and inspect Geo
provider latency/error metrics. Do not bypass the adapter or expose the key in
the browser.

## Secret rotation

Create a replacement secret in Infisical staging, update the affected key, and
run `pnpm platform:config:staging` followed by `pnpm platform:up:staging`.
Run Gateway readiness and the public smoke suite. Revoke the old provider key
only after the new deployment passes. Rotate Supabase, database and internal
service credentials one dependency at a time, preserving a tested rollback
window.
