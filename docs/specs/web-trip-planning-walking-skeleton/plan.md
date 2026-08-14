# Web Trip Planning Walking Skeleton — Technical Plan

**Version:** 1.1.0
**Status:** Approved
**Approved:** 2026-08-14
**Created:** 2026-08-14
**Revised:** 2026-08-14 — Redis + BullMQ selected as the initial durable queue
**Specification:** `./spec.md`
**Constitution:** `../../architecture/constitution.md`

## 1. Mục tiêu kỹ thuật

Triển khai một vertical slice production-oriented cho web, đi xuyên qua:

```text
Next.js Web
  → API Gateway
  → Core Trip Service
  → PostgreSQL/Supabase
  → Geo Location Service
  → VietMap + Redis
  → Transactional Outbox
  → Redis + BullMQ
  → Notification Worker
```

Kết quả phải thay thế dữ liệu planner hard-coded bằng dữ liệu thật, có xác thực,
phân quyền, persistence, routing, event flow, Docker, observability và test.

Mobile, monetization và các module community ngoài user identity không được thay
đổi trong milestone này.

## 2. Quyết định kiến trúc

### 2.1 Deployables được kích hoạt

| Deployable               | Trạng thái trong milestone | Trách nhiệm                                                           |
| ------------------------ | -------------------------- | --------------------------------------------------------------------- |
| Web                      | Active                     | Authentication UI, trip list, editor, map và collaboration UI         |
| API Gateway              | Active                     | Edge auth, rate limit, correlation ID, proxy và API docs entry        |
| Core Trip Service        | Active                     | Trip aggregate, days, stops, members, invitations và outbox           |
| Geo Location Service     | Active                     | Place search, route calculation, VietMap adapter và Redis cache       |
| Notification Worker      | Active, tối thiểu          | Consume `TripCreated` và `TripInvitationCreated`, ghi delivery result |
| Social Community Service | Không active               | Không cần cho walking skeleton; Supabase Auth cung cấp identity       |
| Monetization Service     | Không active               | Ngoài phạm vi                                                         |
| Mobile                   | Không thay đổi             | Ngoài phạm vi                                                         |

### 2.2 Communication

- Web chỉ gọi public API qua API Gateway.
- Gateway gọi Core Trip và Geo Location qua HTTP nội bộ.
- Core Trip không gọi Social Community để xác thực người dùng.
- JWT được gateway xác minh; token/user context tiếp tục được Core Trip xác minh
  để bảo vệ trường hợp truy cập nội bộ sai cấu hình.
- Core Trip gọi Geo Location đồng bộ chỉ khi cần chuẩn hóa place hoặc route.
- Domain side effects được ghi vào outbox cùng transaction nghiệp vụ.
- Outbox publisher chuyển event thành BullMQ job trên Redis.
- Notification Worker consume theo at-least-once và chống xử lý trùng.

### 2.3 Persistence

- Supabase/PostgreSQL là system of record.
- Supabase Auth sở hữu identity và credential.
- Core Trip dùng PostgreSQL transaction qua persistence adapter để bảo đảm thao
  tác tạo trip, owner membership, trip days và outbox là atomic.
- Supabase CLI SQL migrations là nguồn migration duy nhất; ORM không được tự tạo
  schema hoặc migration riêng.
- Redis chỉ giữ cache route, rate-limit state và dữ liệu tạm; không phải system of
  record.

### 2.4 Durable queue

Redis + BullMQ là nền tảng queue ban đầu để tái sử dụng hạ tầng Redis, giảm chi
phí vận hành và vẫn có delayed jobs, retry, backoff, concurrency cùng failed-job
tracking. Redis Pub/Sub bị cấm cho domain events vì subscriber offline có thể làm
mất message. Quyết định phải được ghi lại bằng ADR trước khi code.

Queues ban đầu:

- `trip-events-v1`
- `notification-delivery-v1`

Job names:

- `trip.created.v1`
- `trip.invitation.created.v1`

BullMQ job ID sử dụng integration event ID để chống enqueue trùng. Failed jobs
được giữ theo retention policy để quan sát và replay có kiểm soát. Notification
Worker chỉ hoàn tất job sau khi processed-event record và delivery state đã được
ghi an toàn.

Local có thể dùng chung một Redis instance với key prefix riêng. Production phải
đánh giá tách Redis cache và Redis queue; queue Redis phải bật persistence và
dùng `noeviction` để cache eviction không xóa job.

## 3. Chuẩn hóa monorepo backend

### 3.1 Workspace

- Giữ `server/apps/*` và `server/packages/*` trong pnpm workspace.
- Chuẩn hóa root scripts: build, dev, lint, typecheck, test, test:integration và
  test:e2e.
- Cập nhật Turbo schema/config tương thích với phiên bản đang dùng.
- Hoist hoặc chia sẻ dependency/config hợp lý; không để mỗi app trôi version độc
  lập nếu không có lý do.
- Loại bỏ generated `Hello World` sau khi health endpoints thay thế.
- Không commit `node_modules`, `dist`, coverage hoặc secrets.

### 3.2 Shared packages

```text
packages/
├── contracts/
│   ├── http/
│   └── events/
├── observability/
├── config/
└── test-support/
```

`contracts` chứa runtime schemas và inferred transport types. Domain entity và
database row không được đặt trong package này.

Package `db-client` chỉ cung cấp connection primitives và generated database
types; repository cụ thể nằm trong owning service.

## 4. Domain model: Core Trip

### 4.1 Aggregate và models

```text
Trip aggregate
├── TripId
├── OwnerId
├── Title
├── Description
├── DateRange
├── Money/Budget
├── TripStatus
├── Version
├── TripDay[]
└── TripMember[]

Supporting entities
├── TripStop
└── TripInvitation
```

Quy tắc được enforce trong domain/application layer:

- Title sau trim không rỗng và có giới hạn độ dài.
- Date range liên tục, tối đa 30 ngày.
- Tạo trip đồng thời tạo owner membership và toàn bộ days.
- Mỗi trip có đúng một owner.
- Viewer không được mutation itinerary.
- Editor không được xóa trip hoặc quản lý member.
- Stop chỉ thuộc day của cùng trip.
- Stop order duy nhất và liên tục trong một day sau mutation.
- Budget không âm; currency mặc định `VND` và không thay đổi âm thầm.
- Update bắt buộc có expected version để chống lost update.
- Soft-deleted trip không được đọc hoặc sửa qua API thông thường.

### 4.2 Phân loại model

Mỗi model phải nằm đúng layer:

- Domain: `Trip`, `TripDay`, `TripStop`, `TripInvitation`, value objects.
- Persistence: row mappings tương ứng với PostgreSQL.
- HTTP: create/update/list/detail/search/route DTO.
- Event: `TripCreatedV1`, `TripInvitationCreatedV1`.
- Read: trip list summary và trip planner detail.
- Provider: VietMap request/response models chỉ nằm trong geo adapter.

## 5. Database plan

Không sửa migration đã áp dụng. Tạo migration mới để chuẩn hóa schema hiện tại
và giải quyết migration trùng lặp.

### 5.1 `trip_schema.trips`

| Cột                        | Kiểu/ý nghĩa                                                             |
| -------------------------- | ------------------------------------------------------------------------ |
| `id`                       | UUID primary key                                                         |
| `owner_id`                 | UUID của Supabase Auth user                                              |
| `title`                    | Text có constraint sau trim                                              |
| `description`              | Nullable text                                                            |
| `start_date`, `end_date`   | Date, `end_date >= start_date`, tối đa 30 ngày                           |
| `status`                   | Constrained enum/value: PLANNING, ONGOING, COMPLETED, CANCELLED, DELETED |
| `budget_amount`            | Numeric không âm                                                         |
| `currency`                 | ISO currency, mặc định VND                                               |
| `version`                  | Integer optimistic lock, bắt đầu từ 1                                    |
| `deleted_at`               | Nullable timestamp                                                       |
| `created_at`, `updated_at` | Audit timestamps                                                         |

Indexes: owner/status, date range, updated time.

### 5.2 `trip_schema.trip_members`

| Cột                       | Kiểu/ý nghĩa          |
| ------------------------- | --------------------- |
| `id`                      | UUID primary key      |
| `trip_id`, `user_id`      | Membership identity   |
| `role`                    | OWNER hoặc MEMBER     |
| `permission`              | VIEW hoặc EDIT        |
| `status`                  | ACTIVE, LEFT, REMOVED |
| `joined_at`, `updated_at` | Audit timestamps      |

Unique `(trip_id, user_id)`. Database guard bảo đảm không có hơn một active
owner.

### 5.3 `trip_schema.trip_days`

- `id`, `trip_id`, `date`, `day_index`, timestamps.
- Unique `(trip_id, date)` và `(trip_id, day_index)`.
- Day index bắt đầu từ 0 hoặc 1 phải được thống nhất trong contract; plan chọn
  bắt đầu từ 1 ở persistence và API.

### 5.4 `trip_schema.trip_stops`

- `id`, `trip_id`, `day_id`.
- `place_id`, `name`, `address`, `latitude`, `longitude` là snapshot tại lúc thêm.
- `stop_index`, `notes`, optional arrival/departure time.
- `version`, created/updated timestamps.
- Unique `(day_id, stop_index)`.
- Coordinate constraints hợp lệ.

Việc reorder nhiều stop phải chạy trong transaction và tránh temporary unique
constraint collision.

### 5.5 `trip_schema.trip_invitations`

- `id`, `trip_id`, inviter ID.
- Normalized invitee email.
- Permission VIEW hoặc EDIT.
- Token hash; không lưu raw token.
- Status PENDING, ACCEPTED, DECLINED, EXPIRED, REVOKED.
- Expiration, accepted user ID và audit timestamps.
- Một pending invitation còn hiệu lực cho cùng trip/email.

### 5.6 `trip_schema.outbox_events`

- Event ID, aggregate type/ID, event type/version.
- JSON payload, correlation ID, occurred time.
- Publish state, attempts, next attempt và published time.
- Index phục vụ polling các event chưa publish.

### 5.7 `notification_schema`

- `processed_events` chống consume trùng.
- `notification_deliveries` ghi channel, recipient, state, attempts và lỗi đã
  redacted.

### 5.8 RLS và service authorization

- Owner: full trip management.
- Editor: read và itinerary mutation.
- Viewer: read-only.
- Outsider: no access.
- Invitation acceptance chỉ áp dụng cho identity/email phù hợp.
- RLS policy và service authorization phải có cùng ma trận kỳ vọng.
- Backend dùng privileged credential phải authorize trước mọi repository command.
- Function `SECURITY DEFINER` phải cố định `search_path`, giới hạn execute grants
  và tránh recursive policy behavior.

## 6. HTTP API plan

Public prefix: `/api/v1`. Gateway giữ correlation ID và forward identity context.

### 6.1 Authentication/session

- `GET /api/v1/me` — trả identity tối thiểu cho web session.
- OAuth/session lifecycle chủ yếu do Supabase Auth đảm nhiệm.

### 6.2 Trips

- `POST /api/v1/trips`
- `GET /api/v1/trips?cursor=&limit=`
- `GET /api/v1/trips/:tripId`
- `PATCH /api/v1/trips/:tripId`
- `DELETE /api/v1/trips/:tripId` — soft delete, owner only

Create và mutation nhận `Idempotency-Key` khi phù hợp. Update nhận expected
version; version mismatch trả stable conflict error.

### 6.3 Stops

- `POST /api/v1/trips/:tripId/days/:dayId/stops`
- `PATCH /api/v1/trips/:tripId/stops/:stopId`
- `DELETE /api/v1/trips/:tripId/stops/:stopId`
- `PUT /api/v1/trips/:tripId/days/:dayId/stops/order`
- `PUT /api/v1/trips/:tripId/stops/:stopId/day`

### 6.4 Members và invitations

- `GET /api/v1/trips/:tripId/members`
- `POST /api/v1/trips/:tripId/invitations`
- `GET /api/v1/trip-invitations/:token`
- `POST /api/v1/trip-invitations/:token/accept`
- `POST /api/v1/trip-invitations/:token/decline`
- `DELETE /api/v1/trips/:tripId/invitations/:invitationId`
- `PATCH /api/v1/trips/:tripId/members/:memberId`
- `DELETE /api/v1/trips/:tripId/members/:memberId`

Raw invitation token chỉ xuất hiện ở create response/delivery payload và không
được log.

### 6.5 Geo

- `GET /api/v1/places/search?q=&cursor=`
- `POST /api/v1/routes/preview`

Route preview nhận ordered coordinates cùng vehicle mode. Response trả encoded
geometry hoặc GeoJSON, distance, duration, source và thời điểm tính.

Gateway có thể proxy trực tiếp đến Geo Service; Core Trip không sở hữu route
preview read request.

### 6.6 Response và error contract

Sử dụng envelope nhất quán theo Constitution. Error codes tối thiểu:

- `AUTH_REQUIRED`, `AUTH_INVALID`
- `FORBIDDEN`, `TRIP_NOT_FOUND`
- `TRIP_DATE_RANGE_INVALID`, `TRIP_DATE_RANGE_TOO_LONG`
- `TRIP_VERSION_CONFLICT`
- `DAY_NOT_FOUND`, `STOP_NOT_FOUND`, `STOP_ORDER_INVALID`
- `INVITATION_INVALID`, `INVITATION_EXPIRED`
- `PLACE_PROVIDER_UNAVAILABLE`, `ROUTE_UNAVAILABLE`
- `VALIDATION_FAILED`, `RATE_LIMITED`, `INTERNAL_ERROR`

## 7. Geo Location Service plan

### 7.1 VietMap adapter

- Adapter riêng cho place search và routing.
- Runtime validation cho provider responses.
- Timeout ngắn, bounded retry chỉ cho lỗi transient.
- Circuit breaker để tránh provider outage làm cạn tài nguyên.
- Provider error được map sang stable internal error.
- API key chỉ tồn tại server-side.

### 7.2 Redis cache

- Search cache key dựa trên normalized query, locale và pagination.
- Route cache key dựa trên rounded ordered coordinates, vehicle và route options.
- TTL khác nhau cho search và route; TTL là config có validation.
- Cache miss/failure không được biến thành correctness failure.
- Theo dõi hit rate, provider latency và estimated provider cost.

## 8. API Gateway plan

- Global `/api/v1` prefix.
- JWT verification bằng Supabase JWKS; không gọi remote `getUser` cho mọi request.
- CORS allowlist, Helmet và body-size limits.
- Distributed rate limit qua Redis cho public/authenticated routes.
- Accept hoặc tạo `X-Correlation-ID`, validate format và propagate.
- Proxy timeout, upstream error mapping và no-domain-logic rule.
- Swagger/OpenAPI cho public contract.
- `/health/live` và `/health/ready`; readiness phản ánh dependency bắt buộc.

## 9. Web plan

### 9.1 Routing

```text
/login
/trips
/trips/new
/trips/[tripId]
/trip-invitations/[token]
```

Route groups hiện có có thể được giữ nếu không làm public URL khác đi. Redirect
placeholder `/planner/new-trip` phải được loại bỏ.

### 9.2 Feature modules

```text
src/features/
├── auth/
│   ├── server/
│   ├── client/
│   └── components/
└── trip-planning/
    ├── api/
    ├── model/
    ├── components/
    └── validation/
```

### 9.3 Components/views

- Auth callback/session boundary.
- Protected layout.
- `TripListView`, `TripCard`, empty/error/loading states.
- `CreateTripForm`.
- `TripEditorView`.
- Day navigation/tabs.
- Place search combobox.
- Stop list với reorder và move-day behavior.
- Real map panel và route summary.
- Save indicator và retry action.
- Member/invitation dialog và permission controls.
- Version-conflict dialog.

UI mock hiện tại được tái sử dụng khi phù hợp, nhưng hard-coded trip, fake route,
fake budget metrics và placeholder social proof không được xuất hiện như dữ liệu
thật.

### 9.4 State và data access

- Server session được xử lý bằng Supabase SSR-compatible client.
- API client có runtime response validation và stable error mapping.
- Server state dùng một query/mutation layer có cache invalidation rõ ràng.
- Form state tách khỏi server state.
- Mutation dùng optimistic UI chỉ khi rollback an toàn.
- Autosave được debounce, có sequence/version protection và trạng thái visible.
- Không đặt service-role credential hoặc VietMap secret trong browser bundle.

### 9.5 Map

- Thay `SimulatedMap`/fake SVG bằng map provider thật cho editor.
- Marker lấy từ persisted stops.
- Route geometry lấy từ Geo API.
- Empty/error/fallback state không che mất itinerary sidebar.
- Map library được lazy-load để kiểm soát initial bundle.

## 10. Docker và local environment

### 10.1 Images

Tạo Dockerfile multi-stage riêng hoặc parameterized build target cho:

- `api-gateway`
- `core-trip-service`
- `geo-location-service`
- `notification-worker`
- `web`

Yêu cầu: pinned base, pnpm lockfile, workspace-aware pruning, non-root runtime,
production dependencies, correct Nest `dist/main.js`, graceful shutdown và health
check.

Dockerfile hiện tại dùng `package-lock.json` và `dist/server.js`, không phù hợp
backend pnpm/Nest hiện tại và phải được thay thế.

### 10.2 Docker Compose

Compose local tối thiểu gồm:

- Gateway
- Core Trip
- Geo Location
- Notification Worker
- Web
- Redis
- Redis phục vụ cache và BullMQ; Bull Board chỉ bật bằng development profile
- Supabase local stack được khởi động qua Supabase CLI hoặc profile riêng được
  tài liệu hóa

Monetization và Social Community không chạy mặc định. Dùng healthcheck và
`depends_on` theo readiness, network nội bộ và named volumes. Không dùng
`container_name` để giữ khả năng scale local.

### 10.3 Ports đề xuất

- Web: `3000`
- Gateway: `4000`
- Core Trip: `4101`
- Geo Location: `4102`
- Notification health: `4105`
- Redis: `6379`
- Bull Board development profile: `3001`

## 11. Configuration

Mỗi deployable phải validate environment khi startup. Nhóm config:

- Runtime: environment, port, log level, public base URLs.
- Supabase: URL, anon key phía web, JWKS/auth settings, server DB credentials.
- Internal service URLs và shared internal authentication policy.
- Redis URL và cache TTL.
- Redis/BullMQ connection, queue names, prefixes, concurrency, retry, backoff và
  failed-job retention.
- VietMap base URL, server key, timeouts.
- CORS allowlist và rate limits.

Commit `.env.example` không chứa secret. Local secrets nằm trong ignored env file;
production lấy từ platform secret manager.

## 12. Observability

- JSON structured logging trong production, pretty logs trong local.
- Correlation ID xuyên web request, gateway, services, outbox và event consumer.
- Không log JWT, invitation raw token, email đầy đủ, coordinate chính xác hoặc
  provider secret.
- Metrics: request count/latency/error, DB latency, outbox lag, publish failure,
  queue depth, consumer failure, Redis hit rate và VietMap latency.
- Sentry cho unhandled exceptions; OpenTelemetry hook được chuẩn bị cho trace.
- Health endpoints tách liveness/readiness.

## 13. Security plan

- PKCE/session-safe auth cho web.
- HttpOnly cookie hoặc Supabase SSR session mechanism; tránh localStorage token
  khi không cần thiết.
- Gateway và owning service đều verify identity.
- Authorization policy tests cho owner/editor/viewer/outsider.
- Input runtime validation và output serialization allowlist.
- Rate limit login-adjacent, place search, route và invitation creation.
- Invitation token entropy đủ mạnh, chỉ lưu hash và có expiration.
- CSP được điều chỉnh cho map provider; không mở wildcard tùy tiện.
- Dependency/container scanning giữ trong CI.
- RLS được dùng như defense in depth, không thay thế service authorization.

## 14. Testing plan

### 14.1 Unit

- DateRange, title, budget, role/permission và trip status rules.
- Create trip và day generation.
- Stop reorder/move.
- Optimistic version conflict.
- Invitation lifecycle.
- VietMap response/error mapping và cache key normalization.

### 14.2 Integration

- Clean migration apply.
- Repositories với PostgreSQL thật.
- Atomic create trip + member + days + outbox.
- Outbox publisher retry.
- Redis cache behavior.
- BullMQ enqueue/consume/retry/idempotency/failed-job handling.

### 14.3 Authorization/RLS matrix

Kiểm tra owner, editor, viewer và outsider cho trip, days, stops, members và
invitations; kiểm tra cả direct database policy path và privileged backend path.

### 14.4 Contract

- Gateway ↔ Core Trip.
- Gateway ↔ Geo Location.
- Outbox/event producer ↔ Notification Worker.
- Web API client ↔ public OpenAPI/runtime schemas.

### 14.5 End-to-end

- Journey A: auth → create → stops → route → reload.
- Journey B: login lại → edit → save.
- Journey C: invite → accept → permission change → revoke.
- Provider unavailable không làm mất itinerary.
- Duplicate create không tạo duplicate.
- Concurrent update trả conflict.

### 14.6 Load/resilience smoke

- Burst place search chứng minh rate limit/cache.
- Route cache hit không gọi provider lặp.
- Notification consumer restart không mất hoặc duplicate side effect.
- Gateway trả failure có kiểm soát khi upstream unavailable.

## 15. CI/CD plan

Quality gate theo affected workspace:

1. Install bằng frozen lockfile.
2. Format check, lint và strict typecheck.
3. Unit tests.
4. Migration validation trên database sạch.
5. Integration và contract tests.
6. Web/backend builds.
7. Container build và Trivy scan.
8. E2E trên ephemeral/local stack.
9. Publish signed images sau khi gate đạt.
10. Deploy staging, smoke test và manual/controlled production promotion.

Workflow hiện tại tham chiếu reusable CI và root Docker context; cần xác minh lại
để hỗ trợ monorepo gồm nhiều image thay vì giả định một Node application.

## 16. Trình tự triển khai

### Phase 0 — Documentation and decisions

- Đồng bộ `backend_supabase_plan.md` với NestJS 5+1.
- ADR cho service boundaries, Redis + BullMQ, database access và deployment
  topology.
- Chốt contract conventions và Definition of Done.

### Phase 1 — Workspace foundation

- Chuẩn hóa pnpm/Turbo/config/packages.
- Configuration validation, logging, correlation ID và health/readiness.
- Dockerfiles và minimal Compose.

### Phase 2 — Identity and gateway

- Supabase web session.
- Gateway JWT verification, CORS, rate limit và proxy.
- `/me` và protected routing.

### Phase 3 — Core Trip vertical slice

- Corrective migrations.
- Domain models và repositories.
- Create/list/detail/update trip.
- Days, stops, optimistic concurrency và idempotency.
- Outbox event trong transaction.

### Phase 4 — Geo integration

- Place search và route preview.
- VietMap adapter, Redis cache và resilience.
- Persisted stops hiển thị trên real map.

### Phase 5 — Collaboration

- Invitation lifecycle.
- Owner/editor/viewer authorization.
- Member management và web UI.
- Invitation event flow.

### Phase 6 — Messaging

- Outbox publisher.
- BullMQ queues, job policies và Bull Board development profile.
- Notification worker idempotent consumer và delivery record.

### Phase 7 — Product hardening

- Loading/error/empty/retry/conflict states.
- Analytics events.
- Full test matrix, security checks và performance smoke.
- Staging deploy, restore/rollback documentation và acceptance run.

## 17. Milestone gates

| Gate                  | Điều kiện hoàn thành                                 |
| --------------------- | ---------------------------------------------------- |
| G0 Architecture ready | ADRs, contracts và docs thống nhất                   |
| G1 Platform runnable  | Docker local stack healthy, config và logs hoạt động |
| G2 Trip persistence   | Authenticated create/list/detail survives reload     |
| G3 Planner usable     | Days/stops/reorder/save/conflict chạy thật           |
| G4 Routing usable     | Search/map/route hoạt động và degrade an toàn        |
| G5 Collaboration safe | Invitation và permission matrix đạt                  |
| G6 Event flow durable | Outbox → BullMQ → worker không mất/nhân side effect  |
| G7 Staging accepted   | Journey A/B/C, security và recovery checks đạt       |

## 18. Rủi ro và biện pháp

| Rủi ro                                        | Biện pháp                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Scope quá lớn cho cá nhân                     | Gate theo phase; không mở feature tiếp theo trước khi gate hiện tại đạt    |
| Supabase RLS và privileged backend lệch quyền | Một permission matrix dùng chung cho service tests và RLS tests            |
| Migration cũ trùng/xung đột                   | Audit lịch sử; chỉ thêm corrective migration; clean-reset test trong CI    |
| Distributed transaction                       | Local DB transaction + outbox; không dùng cross-service transaction        |
| VietMap outage/cost                           | Timeout, cache, circuit breaker, quota metrics và fallback UI              |
| Duplicate events                              | Event ID, processed-event store và idempotent consumer                     |
| Docker monorepo sai artifact                  | Workspace-aware multi-stage builds và image smoke tests                    |
| Web mock lẫn dữ liệu thật                     | Xóa hard-coded operational data; explicit demo fixtures chỉ trong dev/test |
| Solo developer vận hành quá tải               | Chỉ deploy service của active slice; automation và runbook tối thiểu       |

## 19. Không thực hiện trong plan này

- Thay đổi code mobile.
- Check-in, expense hoặc memory nghiệp vụ hoàn chỉnh.
- Live GPS, proximity alert hoặc SOS.
- Social feed/community production behavior.
- Monetization/payment production behavior.
- Push/email provider thực tế ngoài adapter/test double tối thiểu.
- Kubernetes hoặc service mesh.
- Tách mỗi service sang database cluster riêng.

## 20. Điều kiện chuyển sang Tasks

Technical Plan sẵn sàng chia task khi:

1. Specification vẫn ở trạng thái Approved.
2. Redis + BullMQ là durable queue ban đầu; Redis Pub/Sub không được dùng cho
   integration events.
3. Chủ dự án đồng ý PostgreSQL transaction adapter cho Core Trip thay vì chỉ dùng
   Supabase REST client.
4. Owner/editor/viewer permission model được chấp nhận.
5. Artifacts SDD và kiến trúc tiếp tục được version-control trong `docs/`.
