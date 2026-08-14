# Road Trip Platform Engineering Constitution

**Version:** 1.1.0

**Ratified:** 2026-08-14

**Status:** Active (repository-tracked)

## 1. Purpose

This constitution defines the non-negotiable engineering principles for the
Road Trip Platform. The product is both a production-oriented startup and a
learning project, but production safety, maintainability, and user value take
precedence over demonstrating unnecessary technical complexity.

All specifications, implementation plans, tasks, code reviews, and architecture
decisions must comply with this document.

## 2. Product principles

### 2.1 User value first

The primary product promise is to help travelers plan, execute, preserve, and
share multi-day road trips more effectively than a combination of maps and
notes.

Engineering work must contribute to a measurable user journey. Infrastructure
or abstraction without a current product, reliability, security, or operational
need must not delay an end-to-end usable feature.

### 2.2 Vertical slices over horizontal scaffolding

Each delivery milestone must complete a testable path from client to persisted
data. A working narrow journey is preferred over many disconnected controllers,
screens, or service skeletons.

The first production walking skeleton is:

1. An authenticated user creates a trip through the API Gateway.
2. Core Trip Service validates authorization and domain invariants.
3. The trip is persisted in PostgreSQL/Supabase.
4. Stops can be resolved or routed through Geo Location Service.
5. A durable domain event can be consumed asynchronously.
6. The result can be observed, tested, and safely retried.

### 2.3 Evidence-based scaling

The architecture must permit independent scaling, but capacity changes and
service extraction must be justified by measurements such as request rate,
latency, queue depth, database load, reliability, cost, or team ownership.

An expected user count alone is not sufficient evidence for additional
services or infrastructure.

## 3. Architecture principles

### 3.1 Right-sized microservices are the target architecture

The backend consists of five bounded-context services and one edge gateway:

| Deployable | Owned capabilities |
| --- | --- |
| `api-gateway` | Authentication enforcement, rate limiting, request routing, correlation IDs, edge response policy |
| `core-trip-service` | Trips, itineraries, membership, check-ins, expenses, and trip memories |
| `geo-location-service` | Places, geocoding, VietMap integration, routing, GPS tracking, proximity, and geographic alerts |
| `social-community-service` | User profiles, social graph, posts, comments, reviews, and community interactions |
| `monetization-service` | Partners, campaigns, subscriptions, affiliates, invoices, and payments |
| `notification-worker` | Asynchronous push, email, in-app delivery, retries, and delivery records |

These boundaries must not be split further without an Architecture Decision
Record (ADR) supported by operational or organizational evidence.

### 3.2 Each service is internally modular

Each service must use explicit domain, application, infrastructure, and
transport boundaries where the complexity warrants them:

```text
service/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Simple CRUD does not require artificial domain abstractions. Business rules,
state transitions, permissions, money, and location-sensitive behavior must not
be implemented only in controllers or clients.

### 3.3 The gateway contains no domain logic

The API Gateway may authenticate, rate-limit, route, normalize edge errors, and
perform limited read aggregation. It must not own trip, social, geographic, or
payment business rules and must not write domain tables directly.

### 3.4 Services remain independently replaceable

A service must not import another service's domain entities, repositories, or
internal modules. Cross-service interaction must use versioned API or event
contracts.

Shared packages may contain:

- Transport-safe contract schemas
- Event envelopes and metadata
- Stable error-code conventions
- Logging and observability primitives

Shared packages must not contain:

- Database entities
- Domain aggregates
- Service-specific repositories
- Mutable business rules shared across bounded contexts

### 3.5 Synchronous and asynchronous communication are intentional

Synchronous HTTP communication is allowed only when the caller requires an
immediate answer. Every network call must have an explicit timeout and a defined
failure behavior.

Side effects that do not need to complete within the user request must use a
durable message broker. In-process event emitters are not a substitute for
cross-service messaging.

Critical event publication must use a transactional outbox or an equivalently
reliable mechanism. Consumers must be idempotent and support bounded retries and
dead-letter handling.

### 3.6 Deployment topology may evolve

The bounded contexts above are architectural boundaries. During early delivery,
services that have not entered a vertical slice do not need to be deployed.
Deployment count may grow with product needs, provided code and data ownership
remain intact.

## 4. Domain and data principles

### 4.1 One owner for every business fact

Every table, record, and business rule has exactly one owning bounded context.
Other services may reference the owner's public identifier or maintain an
event-driven read model, but may not mutate the owner's data directly.

### 4.2 Logical database isolation from day one

Services may initially share one Supabase/PostgreSQL cluster for cost and
operational simplicity. They must use separate schemas and least-privilege
database roles:

- `trip_schema`
- `geo_schema`
- `social_schema`
- `monetization_schema`
- `notification_schema`

Application code must not perform cross-schema joins for domain behavior.
Cross-context foreign keys are prohibited unless an ADR documents why future
database separation is intentionally being traded away.

### 4.3 Domain invariants are enforced server-side

Database constraints protect structural integrity. Domain services protect
business invariants and authorization. Clients are never the sole enforcement
point.

State values, roles, dates, ordering, monetary amounts, and uniqueness must use
appropriate constraints. Important concurrent updates must use optimistic
locking or another explicit concurrency policy.

### 4.4 Migrations are immutable and reproducible

Applied migrations must not be edited. New corrections require new migrations.
Migrations must run in local development and CI from a clean database. Backup,
restore, rollout, and rollback behavior must be documented before production.

### 4.5 Location and payment data receive heightened protection

Precise location and payment-related data are sensitive. Specifications must
define collection purpose, access policy, retention, deletion, and audit needs.
The platform must minimize stored location history and must never log tokens,
payment secrets, or precise coordinates without an approved operational need.

## 5. Technology standards

### 5.1 Canonical backend stack

- TypeScript with strict type checking
- NestJS for gateway and service applications
- pnpm workspaces and Turborepo for the backend monorepo
- Supabase/PostgreSQL, including PostGIS where geographic queries require it
- Supabase Auth as the identity provider
- Redis only for explicit ephemeral, caching, coordination, or rate-limit needs
- A durable broker for inter-process asynchronous messaging
- OpenAPI and runtime schemas for HTTP contracts
- Versioned runtime-validated schemas for event contracts

Any replacement of these foundations requires an ADR. Documentation must not
describe Express, MongoDB, or another superseded stack as the active design.

### 5.2 Type safety includes runtime validation

TypeScript types alone are insufficient at trust boundaries. HTTP input, event
payloads, configuration, external provider responses, and webhook bodies must
be validated at runtime.

Generated database types must not be exposed directly as public API contracts.

### 5.3 External providers are accessed through adapters

VietMap, Supabase, Redis, storage, FCM, email, and payment providers must be
isolated behind application ports or infrastructure adapters. Provider-specific
models and errors must not leak into the domain layer.

### 5.4 Model boundaries are explicit

The word `model` must not represent every shape in the system. Each service must
distinguish these responsibilities:

- Domain entities and aggregates enforce identity, lifecycle, and invariants.
- Value objects represent validated concepts such as money, coordinates, date
  ranges, and status transitions.
- Persistence models map storage structures and remain in infrastructure.
- API DTOs define versioned HTTP input and output contracts.
- Event models define immutable, versioned integration facts.
- External-provider models are translated by adapters.
- Read models are optimized for a specific query and must not become writable
  domain authorities.

Mapping between these models must be explicit at layer boundaries. Database
rows, Supabase-generated types, and external provider payloads must not be used
as domain models or exposed directly to clients.

### 5.5 Docker is a supported delivery contract

Every deployable service must have a production-oriented Docker image and a
documented local-development path. Container builds must:

- Use pinned, supported base images and multi-stage builds.
- Run as a non-root user.
- Include only production runtime dependencies and required artifacts.
- Expose health and readiness behavior expected by orchestration.
- Handle termination signals and graceful shutdown.
- Avoid embedding secrets or environment-specific configuration.
- Be scanned for known vulnerabilities and built reproducibly where practical.

Docker Compose must provide the minimum local integration environment needed by
the active vertical slice, such as PostgreSQL/Supabase dependencies, Redis, and
the selected durable broker. Optional or future services must use profiles or
remain excluded so local development does not require every planned container.

Containers are deployment units, not domain boundaries. The existence of a
bounded context does not require it to be running before a delivered feature
depends on it.

## 6. API and event standards

### 6.1 Contracts are explicit and versioned

Every externally consumed endpoint and event must define:

- Input and output schema
- Authentication and authorization requirements
- Stable error codes
- Idempotency behavior where relevant
- Pagination strategy for collections
- Compatibility and versioning expectations

Breaking changes require a migration or compatibility plan.

### 6.2 Commands and retries are safe

Payment operations, webhook processing, event consumers, uploads, and other
retry-prone commands must support idempotency. Duplicate delivery must not create
duplicate charges, notifications, expenses, or domain transitions.

### 6.3 Events describe completed facts

Domain event names use past tense, such as `TripCreated`, `TripCompleted`, or
`PaymentSucceeded`. Events must include an event ID, version, timestamp,
correlation ID, producer, aggregate ID, and payload.

Events are integration contracts, not remote commands disguised as facts.

## 7. Security and privacy principles

### 7.1 Authentication is not authorization

Supabase Auth establishes identity. Each owning service must authorize access to
its resources. Gateway authentication does not remove this responsibility.

Use of a Supabase service-role credential bypasses normal RLS protections and
therefore requires explicit server-side authorization and tests.

### 7.2 Least privilege and secret hygiene are mandatory

- Each deployable receives only the credentials it requires.
- Secrets must not be committed, logged, returned to clients, or embedded in
  public environment variables.
- Uploads require size, MIME, ownership, and content validation.
- Payment webhooks require signature verification and replay protection.
- Administrative and payment actions require audit records.

### 7.3 Privacy is part of the feature definition

Features involving GPS, group tracking, photos, contacts, or payments must state
consent, visibility, retention, export, and deletion behavior in their
specification. Live-location sharing must be revocable and expire safely.

## 8. Reliability and observability principles

### 8.1 Failures are designed, not assumed away

Every external dependency must define timeout, retry, fallback, and user-visible
failure behavior. Retries must be bounded and use backoff. Circuit breaking is
required for providers whose failure could exhaust application resources.

### 8.2 Every request and event is traceable

All deployables must provide:

- Structured logs
- Correlation IDs propagated across HTTP and events
- Health and readiness endpoints
- Latency, error-rate, and saturation metrics
- Centralized exception reporting
- Distributed tracing before multi-service production flows become critical

Sensitive data must be redacted from telemetry.

### 8.3 Operational recovery is tested

Production readiness requires documented backup and restore, migration recovery,
queue recovery, provider outage behavior, and graceful shutdown. A backup that
has never been restored in a test does not count as a recovery capability.

## 9. Testing and quality gates

### 9.1 Tests follow risk

The required test layers are:

- Unit tests for domain rules and value calculations
- Integration tests for repositories, migrations, adapters, and outbox behavior
- Authorization and RLS matrix tests
- Contract tests for service APIs and events
- End-to-end tests for critical user journeys
- Load tests for GPS, routing, feeds, and other measured hotspots

Generated default tests do not satisfy these requirements.

### 9.2 Critical paths block release

A change must not be released when its affected critical-path tests, migrations,
contract checks, security checks, or build fail. Flaky tests must be fixed or
explicitly quarantined with an owner and deadline; they must not be silently
ignored.

### 9.3 Code quality favors clarity

- Strict TypeScript and linting are mandatory.
- Public behavior and non-obvious decisions require documentation.
- Names must reflect domain language consistently.
- Circular dependencies are prohibited.
- Abstractions require at least one real use case; speculative frameworks are
  discouraged.

## 10. Delivery and product learning

### 10.1 SDD is mandatory

New features, architecture changes, and backend modules follow this sequence:

1. Constitution review
2. Behavioral specification
3. Technical implementation plan
4. Executable task breakdown
5. Implementation and verification

Implementation must not begin before the preceding artifacts exist and agree.
Urgent production fixes may use an abbreviated specification, but must preserve
the same safety, test, and documentation obligations.

### 10.2 Definition of done

A feature is done only when:

- Acceptance criteria are satisfied.
- Authorization and failure cases are covered.
- Data migrations and contracts are documented.
- Required tests pass.
- Logs and metrics make the feature operable.
- User-facing states handle loading, empty, error, and retry behavior.
- Documentation reflects the implemented system.
- The feature is deployable and observable in the target environment.

### 10.3 Product behavior is measurable

Critical journeys must emit privacy-safe analytics that allow the team to
measure activation, completion, retention, reliability, and external API cost.
Metrics must inform prioritization; they must not be used to justify collecting
unnecessary personal data.

## 11. Architecture governance

### 11.1 ADRs record consequential decisions

An ADR is required for:

- Creating, splitting, merging, or removing a service
- Changing database ownership
- Selecting or replacing a message broker or major provider
- Introducing cross-context synchronous dependencies
- Making a breaking contract change
- Weakening a security, privacy, testing, or reliability rule

ADRs must state context, decision, alternatives, consequences, and migration
strategy.

### 11.2 Exceptions are explicit and temporary

An exception to this constitution must be documented with its scope, reason,
risk, owner, compensating control, and expiration or review date.

### 11.3 Amendment process

Constitution changes require:

1. A written proposal or ADR.
2. Analysis of affected specifications, plans, contracts, and services.
3. A semantic version change:
   - Major: removes or reverses a principle.
   - Minor: adds a principle or materially expands obligations.
   - Patch: clarifies wording without changing obligations.
4. Update of dependent templates and documentation.

The active version and ratification date must remain visible at the top of this
file.

## 12. Immediate compliance priorities

Before the first production vertical slice, the project must:

1. Replace the outdated 15-service/Express architecture documentation with the
   active NestJS 5+1 architecture.
2. Define schema and data ownership for every bounded context.
3. Select and document the durable broker and event contract format.
4. Establish the domain, persistence, DTO, event, provider, and read-model
   conventions used by all services.
5. Provide hardened Dockerfiles and a minimal Docker Compose environment for the
   active vertical slice.
6. Establish gateway authentication and service-level authorization.
7. Implement correlation IDs, structured logging, health, and readiness.
8. Prove one authenticated trip-creation flow end to end.
9. Add domain, integration, authorization/RLS, contract, and E2E tests for that
   flow.
10. Deploy the walking skeleton to staging with documented rollback and
    recovery.
