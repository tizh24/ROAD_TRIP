# Local platform infrastructure

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
