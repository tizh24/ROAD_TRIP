# Hosted Native Development — Specification

**Status:** Approved  
**Created:** 2026-10-14

## Goal

Develop and test Road Trip without Docker Desktop or local containers. The web
and backend services run as native processes on the developer machine while
stateful dependencies use hosted services.

## Required behavior

- One documented command starts Gateway, Core Trip, Geo and Notification Worker
  without invoking Docker or Docker Compose.
- The command uses Supabase Cloud for identity and PostgreSQL, and a hosted
  Redis-compatible endpoint for cache, rate limiting and BullMQ.
- Gateway communicates with local Core Trip and Geo processes through loopback
  addresses only.
- Secrets stay in an ignored local environment file and are never printed by
  scripts or committed to the repository.
- Existing Docker Compose remains optional for CI and developers who need a
  fully local integration stack.

## Acceptance criteria

1. A developer with valid hosted Supabase, PostgreSQL, Redis and provider
   credentials can start the active backend without Docker Desktop.
2. Gateway is reachable at `http://127.0.0.1:4100` and its Swagger page loads.
3. Missing hosted configuration names are reported without revealing values.
4. Web can use `http://127.0.0.1:4100/api/v1` during local development.
