# Local platform infrastructure

## Active stack

The default Compose project starts only the active web walking skeleton:

- Web on <http://localhost:3000>
- API Gateway on <http://localhost:4100>
- Core Trip Service (internal only)
- Geo Location Service (internal only)
- Notification Worker (internal only)
- Redis on `127.0.0.1:6379`

Social Community and Monetization are intentionally absent. Compose uses a
private bridge network and named Redis volume; no `container_name` is set, so
multiple project names and future scaling remain possible.

### Supabase CLI prerequisite

Supabase remains managed by its CLI instead of being duplicated in this Compose
file. Install the Supabase CLI, then run these commands from `server/`:

```powershell
supabase start
pnpm platform:up
```

`supabase/config.toml` publishes the local API on `54321` and PostgreSQL on
`54322`. Containers reach those host ports through `host.docker.internal`.
`pnpm platform:up` builds the active images, waits for every healthcheck, and
returns only when the stack is healthy. Use `pnpm platform:down` to stop the
Compose services and `supabase stop` to stop the CLI-managed Supabase stack.

The current skeleton validates connection settings but does not yet register
database/Redis readiness probes; those adapters are added with their owning
feature tasks. Do not treat these placeholder-ready endpoints as proof that
Supabase is reachable.

### Graceful shutdown verification

Run the repeatable stop/restart smoke test from `server/`:

```powershell
pnpm verify:platform-shutdown
```

The script starts the active stack under an isolated Compose project, creates a
waiting BullMQ job, sends the normal Compose stop signal with a ten-second
timeout, rejects forced `SIGKILL` exits and unhandled runtime errors, restarts to
healthy, and confirms the job is still waiting. It always removes its test
containers, network, and volume.

At this foundation stage the services own HTTP listeners only. The BullMQ smoke
client explicitly closes its queue and Redis connection. No PostgreSQL pool,
runtime Redis client, or BullMQ worker is instantiated yet. When those adapters
are added, their owning Nest providers must implement shutdown lifecycle hooks
and this smoke test must continue to pass; configuration values alone do not
represent open connections.

### Development tools profile

Bull Board is excluded from the default stack. Start it only for local queue
inspection with:

```powershell
$env:BULL_BOARD_PASSWORD = 'choose-a-local-password'
pnpm platform:up:tools
```

The dashboard is then available only on <http://127.0.0.1:3001>. Sign in with
`BULL_BOARD_USER` (defaults to `admin`) and the required `BULL_BOARD_PASSWORD`.
The local adapter is read-only and formats job data before rendering: event
payloads, aggregate IDs, correlation IDs, and return values are replaced with
`[REDACTED]`. This does not alter the full BullMQ payload consumed by workers.
It is not a production deployment path and must not be exposed publicly.

## Redis baseline

Local development uses one Redis instance with a named volume, RDB snapshots,
and an append-only file synchronized every second. Its eviction policy is
`noeviction` so memory pressure fails writes instead of silently evicting BullMQ
jobs.

Workloads must use separate key namespaces:

- Cache: `REDIS_CACHE_PREFIX=roadtrip:cache`
- Rate limiting: `REDIS_RATE_LIMIT_PREFIX=roadtrip:rate-limit`
- BullMQ: `BULLMQ_QUEUE_PREFIX=roadtrip:bullmq`

Do not use the cache or rate-limit prefixes for queue keys, and do not use Redis
Pub/Sub for durable integration events.

## Production split strategy

Production should run BullMQ on a dedicated Redis deployment with AOF enabled,
`noeviction`, backups, restore tests, and queue-specific monitoring. Cache and
rate limiting should use a separate Redis deployment where an eviction policy
and capacity limits can be selected without risking queued jobs. They may share
an instance only during an explicitly capacity-tested early deployment; split
them before memory pressure, availability targets, or workload contention differ.
