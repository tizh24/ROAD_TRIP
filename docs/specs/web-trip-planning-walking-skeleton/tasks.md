# Web Trip Planning Walking Skeleton — Implementation Tasks

**Version:** 1.0.0
**Status:** Ready for implementation
**Created:** 2026-08-14
**Specification:** `./spec.md`
**Technical plan:** `./plan.md`

## 1. Cách sử dụng checklist

- Thực hiện theo thứ tự task ID, trừ khi dependency ghi rõ có thể song song.
- Chỉ đánh dấu hoàn thành sau khi verification của task đạt.
- Không gộp nhiều gate thành một thay đổi lớn khó review.
- Nếu implementation làm thay đổi hành vi đã duyệt, cập nhật Specification trước.
- Nếu implementation thay đổi kiến trúc, cập nhật Plan và tạo ADR trước.
- Không sửa mobile, monetization hoặc social-community trong milestone này.

Mỗi task hoàn thành phải để repository ở trạng thái build/test được trong phạm vi
đã tác động.

## Phase 0 — Baseline và quyết định kiến trúc

### T001 — Ghi nhận baseline

- [x] Chạy và lưu kết quả build, lint và test hiện tại của `server` và `web`.
- [x] Phân biệt lỗi có sẵn với regression do milestone.
- [x] Ghi lại phiên bản Node, pnpm, npm, Docker và Supabase CLI đang dùng.

**Dependency:** Không.
**Verify:** Có baseline report trong tài liệu feature; không sửa code để che lỗi.

### T002 — Audit repository hygiene

- [x] Xác nhận toàn bộ `node_modules`, `.next`, `dist`, coverage và `.env*` chứa
      secret được ignore.
- [x] Xác nhận `.env.example` chỉ chứa placeholder.
- [x] Kiểm tra không có key Supabase service-role hoặc VietMap thật trong Git.
- [x] Không xóa thay đổi chưa commit của người dùng.

**Dependency:** T001.
**Verify:** `git status` không liệt kê generated artifacts/secrets mới.

### T003 — ADR service boundaries

- [x] Tạo ADR xác nhận kiến trúc 5 bounded-context services + gateway.
- [x] Ghi rõ service active và inactive trong walking skeleton.
- [x] Ghi rõ data ownership và cấm cross-schema mutation.

**Dependency:** T001.
**Verify:** ADR phù hợp Constitution và Plan.

### T004 — ADR Redis + BullMQ

- [x] Ghi lý do chọn BullMQ thay RabbitMQ ở giai đoạn đầu.
- [x] Cấm Redis Pub/Sub cho durable integration events.
- [x] Ghi production durability, `noeviction`, retention và điều kiện tách Redis.
- [x] Ghi migration path sang broker khác thông qua publisher port.

**Dependency:** T003.
**Verify:** ADR có alternatives, consequences và exit criteria.

### T005 — ADR database access và transaction

- [x] Chốt PostgreSQL transaction adapter cho Core Trip.
- [x] Chốt Supabase CLI migrations là migration source duy nhất.
- [x] Mô tả quan hệ giữa service authorization, DB roles và RLS defense in depth.
- [x] Cấm expose persistence model làm API contract.

**Dependency:** T003.
**Verify:** ADR giải thích được atomic trip creation + outbox.

### T006 — Đồng bộ tài liệu backend

- [x] Thay mô tả 15 service/Express trong `server/backend_supabase_plan.md` bằng
      NestJS 5+1 hiện tại.
- [x] Đồng bộ Redis + BullMQ, Supabase/PostgreSQL và Docker topology.
- [x] Đánh dấu rõ feature hiện tại và future scope.

**Dependency:** T003–T005.
**Verify:** Không còn kiến trúc active mâu thuẫn giữa code, Constitution và docs.

## Phase 1 — Workspace foundation

### T007 — Chuẩn hóa Node và package manager

- [x] Chọn và pin Node LTS được hỗ trợ.
- [x] Xác nhận pnpm là package manager duy nhất của backend.
- [x] Thêm `packageManager` và engine policy tại workspace root.
- [x] Loại bỏ lockfile hoặc hướng dẫn mâu thuẫn trong phạm vi backend.

**Dependency:** T001.
**Verify:** Clean install bằng frozen pnpm lockfile thành công.

### T008 — Chuẩn hóa Turbo tasks

- [x] Cập nhật Turbo configuration theo schema phiên bản đang cài.
- [x] Thêm `typecheck`, `test`, `test:integration`, `test:e2e` pipelines.
- [x] Định nghĩa outputs và cache behavior đúng cho Nest apps/packages.

**Dependency:** T007.
**Verify:** Root commands tìm thấy đúng workspace tasks.

### T009 — Shared TypeScript/lint/format config

- [x] Tạo package/config dùng chung cho strict TypeScript.
- [x] Chuẩn hóa ESLint và Prettier không tự `--fix` trong CI.
- [x] Cho phép lệnh fix riêng trong local.
- [x] Bật kiểm tra circular dependency phù hợp.

**Dependency:** T007.
**Verify:** Gateway, Core Trip và Geo build/typecheck cùng chuẩn.

### T010 — Runtime configuration package

- [x] Tạo runtime schema cho environment variables.
- [x] Phân nhóm common, database, auth, Redis/BullMQ, internal URLs và VietMap.
- [x] Fail fast với lỗi cấu hình đã redacted.
- [x] Cập nhật `.env.example` cho local development.

**Dependency:** T009.
**Verify:** Config hợp lệ boot được; thiếu biến bắt buộc làm startup fail rõ ràng.

### T011 — Observability package

- [x] Tạo structured logger abstraction.
- [x] Thêm redaction cho token, email, invite token và coordinate.
- [x] Tạo correlation ID middleware/interceptor và propagation helpers.
- [x] Chuẩn hóa exception/error logging.

**Dependency:** T009–T010.
**Verify:** Unit test redaction và correlation propagation đạt.

### T012 — HTTP và event contracts package

- [x] Tạo runtime schemas cho response envelope, errors và pagination.
- [x] Tạo integration event envelope v1.
- [x] Tạo `TripCreatedV1` và `TripInvitationCreatedV1` schemas.
- [x] Không import database/domain entities.

**Dependency:** T009.
**Verify:** Invalid HTTP/event payload bị runtime validation từ chối.

### T013 — Health/readiness foundation

- [ ] Thêm `/health/live` và `/health/ready` cho active services.
- [ ] Liveness không phụ thuộc external provider.
- [ ] Readiness phản ánh dependency bắt buộc của từng service.
- [ ] Thay generated Hello World endpoints/tests.

**Dependency:** T010–T011.
**Verify:** Health tests pass và trả status phù hợp khi dependency unavailable.

## Phase 2 — Docker và local platform

### T014 — Backend Docker build strategy

- [ ] Thay Dockerfile backend đang dùng npm/`dist/server.js` sai cấu trúc.
- [ ] Dùng pnpm lockfile và workspace-aware multi-stage build.
- [ ] Hỗ trợ target cho Gateway, Core Trip, Geo và Notification Worker.
- [ ] Chạy runtime non-root và nhận termination signal đúng.

**Dependency:** T007–T013.
**Verify:** Mỗi active backend image build và boot đúng `dist/main.js`.

### T015 — Web production Dockerfile

- [ ] Cấu hình Next.js production output phù hợp container.
- [ ] Tạo multi-stage Dockerfile với pinned base và non-root runtime.
- [ ] Không đưa server secrets hoặc development cache vào image.

**Dependency:** T007.
**Verify:** Web image build và trả trang health/public thành công.

### T016 — Redis durability configuration

- [ ] Cấu hình Redis local persistence.
- [ ] Đặt key prefix riêng cho cache, rate limit và BullMQ.
- [ ] Bật `noeviction` cho queue-safe local baseline.
- [ ] Ghi chú production split strategy cho cache/queue.

**Dependency:** T004.
**Verify:** Redis restart không làm mất BullMQ job test đang chờ.

### T017 — Minimal Docker Compose

- [ ] Compose Web, Gateway, Core Trip, Geo, Notification Worker và Redis.
- [ ] Tích hợp Supabase local bằng CLI hoặc profile được tài liệu hóa.
- [ ] Thêm healthchecks, internal network và named volumes.
- [ ] Không dùng `container_name`.
- [ ] Đặt Bull Board trong development-only profile.
- [ ] Không chạy Social Community/Monetization mặc định.

**Dependency:** T014–T016.
**Verify:** Một lệnh/documented sequence đưa toàn bộ active stack về healthy.

### T018 — Graceful shutdown smoke test

- [ ] Enable Nest shutdown hooks.
- [ ] Đóng HTTP, PostgreSQL, Redis và BullMQ connections sạch.
- [ ] Kiểm tra container stop không để job ở trạng thái sai vĩnh viễn.

**Dependency:** T017.
**Verify:** Stop/restart stack không gây unhandled error hoặc mất test job.

## Phase 3 — Database foundation

### T019 — Audit migrations hiện tại

- [ ] Xác định migration 2024/2026 nào trùng hoặc xung đột.
- [ ] Không chỉnh migration đã được coi là applied.
- [ ] Chọn corrective migration strategy và clean-reset expectation.

**Dependency:** T005.
**Verify:** Có migration audit note và thứ tự apply rõ ràng.

### T020 — Corrective schemas và roles migration

- [ ] Bổ sung `notification_schema`.
- [ ] Chuẩn hóa least-privilege roles/grants/default privileges.
- [ ] Hạn chế execute trên security-definer functions.
- [ ] Cố định function `search_path` an toàn.

**Dependency:** T019.
**Verify:** Clean database reset tạo đủ schema/role không lỗi.

### T021 — Core Trip tables migration

- [ ] Chuẩn hóa trips, members, days và stops theo Plan.
- [ ] Thêm enums/check constraints, currency và version.
- [ ] Thêm unique constraints và indexes.
- [ ] Thêm updated-at behavior và soft-delete metadata.

**Dependency:** T020.
**Verify:** Constraint tests từ chối date, budget, role, order và coordinate sai.

### T022 — Invitation/outbox/notification tables migration

- [ ] Tạo trip invitations và token-hash fields.
- [ ] Tạo outbox events cùng polling indexes.
- [ ] Tạo processed events và notification deliveries.
- [ ] Thiết lập ownership/grants đúng schema.

**Dependency:** T021.
**Verify:** Clean migration apply và database integration smoke pass.

### T023 — RLS policies

- [ ] Viết owner/editor/viewer/outsider policies.
- [ ] Sửa policy hiện tại đang cho mọi member quản lý itinerary.
- [ ] Viết invitation access/acceptance policies.
- [ ] Không tạo recursion hoặc privilege escalation.

**Dependency:** T021–T022.
**Verify:** RLS permission matrix test đạt toàn bộ read/write cases.

### T024 — Database types và repository primitives

- [ ] Generate database types từ schema mới.
- [ ] Tạo PostgreSQL connection/transaction abstraction.
- [ ] Không expose generated type qua public contracts.
- [ ] Thêm database readiness check.

**Dependency:** T021–T023.
**Verify:** Type generation reproducible và connection test đạt.

## Phase 4 — Authentication và API Gateway

### T025 — Supabase web authentication

- [ ] Cấu hình SSR-compatible Supabase client.
- [ ] Thực hiện ít nhất một login method và callback.
- [ ] Thiết lập session refresh/logout.
- [ ] Không lưu service-role key hoặc VietMap key trong browser.

**Dependency:** T010, T015, T020.
**Verify:** User đăng nhập/logout và session còn hợp lệ sau refresh.

### T026 — Protected web routes

- [ ] Bảo vệ `/trips`, `/trips/new`, `/trips/[tripId]`.
- [ ] Redirect về login và giữ return URL.
- [ ] Xử lý expired session rõ ràng.

**Dependency:** T025.
**Verify:** Guest không vào protected route; login xong quay lại đúng URL.

### T027 — Gateway JWT verification

- [ ] Xác minh Supabase JWT bằng JWKS và cache key rotation an toàn.
- [ ] Chuẩn hóa authenticated user context.
- [ ] Không gọi remote `getUser` cho mọi request.
- [ ] Trả stable auth errors.

**Dependency:** T010–T013.
**Verify:** Valid/expired/invalid/missing token tests đạt.

### T028 — Gateway security middleware

- [ ] Cấu hình CORS allowlist, Helmet và body-size limits.
- [ ] Redis-backed rate limits theo route class.
- [ ] Correlation ID validation và propagation.
- [ ] Không log authorization headers.

**Dependency:** T011, T016, T027.
**Verify:** Security/rate-limit/correlation integration tests đạt.

### T029 — Gateway upstream adapters

- [ ] Tạo proxy/client cho Core Trip và Geo.
- [ ] Đặt timeout và stable upstream error mapping.
- [ ] Propagate identity và correlation context.
- [ ] Không đưa domain logic vào gateway.

**Dependency:** T027–T028.
**Verify:** Contract tests với upstream stub đạt.

### T030 — Public OpenAPI

- [ ] Xuất `/api/v1` contracts và auth requirements.
- [ ] Document stable errors, idempotency và version headers.
- [ ] Không expose internal-only endpoints.

**Dependency:** T012, T029.
**Verify:** OpenAPI generation pass và contract không chứa persistence model.

## Phase 5 — Core Trip domain và persistence

### T031 — Core value objects

- [ ] Implement TripId/UserId, TripTitle, DateRange, Money, Currency và Version.
- [ ] Enforce 30-day limit, title trim và non-negative budget.
- [ ] Unit test valid/invalid boundaries.

**Dependency:** T012.
**Verify:** Domain unit suite đạt.

### T032 — Trip aggregate

- [ ] Implement trip lifecycle, owner/member permissions và state rules.
- [ ] Generate sequential days khi tạo trip.
- [ ] Phát domain fact khi tạo thành công.
- [ ] Không phụ thuộc NestJS/PostgreSQL trong domain.

**Dependency:** T031.
**Verify:** Aggregate tests đạt, gồm owner invariant và invalid transitions.

### T033 — Stop ordering domain behavior

- [ ] Add, update, remove, reorder và move-day operations.
- [ ] Giữ order liên tục và không trùng.
- [ ] Enforce editor permission và trip/day ownership.

**Dependency:** T032.
**Verify:** Unit tests bao phủ reorder/move edge cases.

### T034 — Trip repositories

- [ ] Map domain ↔ persistence models rõ ràng.
- [ ] Implement create/list/detail/update/soft-delete.
- [ ] Implement atomic trip + owner + days + outbox transaction.
- [ ] Implement optimistic version check.

**Dependency:** T024, T032.
**Verify:** Repository integration suite trên PostgreSQL thật đạt.

### T035 — Stop repositories

- [ ] Implement add/update/delete/reorder/move transactionally.
- [ ] Tránh temporary unique-order collision.
- [ ] Không cho cross-trip day/stop mutation.

**Dependency:** T024, T033–T034.
**Verify:** Integration tests đạt, gồm concurrent/cross-trip cases.

### T036 — Core authorization policy

- [ ] Tạo policy/service chung cho owner/editor/viewer/outsider.
- [ ] Re-check permission trên mỗi command/query.
- [ ] Không dựa duy nhất vào gateway hoặc RLS.

**Dependency:** T032, T034.
**Verify:** Service authorization matrix đạt cùng expectation với RLS.

### T037 — Trip application use cases

- [ ] Create, list, get, update và soft-delete trip.
- [ ] Add/update/remove/reorder/move stops.
- [ ] Idempotency cho create/mutation phù hợp.
- [ ] Stable domain-to-application error mapping.

**Dependency:** T034–T036.
**Verify:** Application tests bao phủ happy/error/conflict paths.

### T038 — Core Trip HTTP controllers

- [ ] Implement endpoints theo Plan với runtime validation.
- [ ] Xác minh identity trong Core Trip.
- [ ] Propagate correlation ID và expected version.
- [ ] Serialize response bằng DTO allowlist.

**Dependency:** T012, T027, T037.
**Verify:** HTTP integration/contract tests đạt.

## Phase 6 — Redis/BullMQ event flow

### T039 — BullMQ infrastructure adapter

- [ ] Tạo event publisher port và BullMQ adapter.
- [ ] Dùng event ID làm job ID.
- [ ] Cấu hình queue prefix, attempts, backoff và retention.
- [ ] Không dùng Redis Pub/Sub.

**Dependency:** T004, T012, T016.
**Verify:** Duplicate enqueue không tạo duplicate job.

### T040 — Outbox publisher

- [ ] Poll/claim pending outbox rows an toàn với nhiều publisher.
- [ ] Enqueue BullMQ job và đánh dấu published.
- [ ] Retry có backoff; không bỏ event khi Redis unavailable.
- [ ] Ghi outbox lag/failure metrics.

**Dependency:** T022, T034, T039.
**Verify:** PostgreSQL/Redis failure integration tests chứng minh eventual publish.

### T041 — Notification idempotent consumer

- [ ] Consume `TripCreatedV1` và `TripInvitationCreatedV1`.
- [ ] Runtime validate event.
- [ ] Ghi processed event và delivery state idempotently.
- [ ] Phân biệt retryable và terminal failures.

**Dependency:** T022, T039–T040.
**Verify:** Retry/restart/duplicate tests không nhân side effect.

### T042 — Bull Board development profile

- [ ] Thêm read-protected Bull Board chỉ trong development profile.
- [ ] Không expose production mặc định.
- [ ] Redact sensitive job data khỏi UI/logs.

**Dependency:** T039, T017.
**Verify:** Dev profile xem được queue; default/production không expose dashboard.

## Phase 7 — Geo Location Service

### T043 — Geo contracts

- [ ] Runtime schemas cho place search và route preview.
- [ ] Chuẩn hóa coordinate, vehicle mode, pagination và geometry response.
- [ ] Stable provider-independent errors.

**Dependency:** T012.
**Verify:** Contract validation tests đạt.

### T044 — VietMap adapter

- [ ] Implement place search và route calls phía server.
- [ ] Validate provider response.
- [ ] Timeout, bounded retry và circuit breaker.
- [ ] Không leak API key/provider error ra client.

**Dependency:** T010, T043.
**Verify:** Adapter tests với fixtures cho success/malformed/timeout/rate-limit.

### T045 — Geo Redis cache

- [ ] Normalize search và route cache keys.
- [ ] Round coordinate ở độ chính xác được document.
- [ ] Config TTL riêng.
- [ ] Cache failure không phá correctness.

**Dependency:** T016, T044.
**Verify:** Hit/miss/expiry/provider-call-count tests đạt.

### T046 — Geo HTTP controllers

- [ ] Implement place search và route preview endpoints.
- [ ] Runtime validation, rate-limit compatibility và stable envelopes.
- [ ] Metrics provider latency/cache hit/cost proxy.

**Dependency:** T043–T045.
**Verify:** Geo integration và Gateway contract tests đạt.

## Phase 8 — Web trip planning

### T047 — Web API client

- [ ] Tạo authenticated Gateway client.
- [ ] Runtime validate responses và map stable errors.
- [ ] Propagate correlation/idempotency/version headers.
- [ ] Không dùng hard-coded API data trong production path.

**Dependency:** T012, T025–T030, T038, T046.
**Verify:** Client contract tests đạt.

### T048 — Trip list

- [ ] Tạo `/trips` với loading/error/empty/content states.
- [ ] Hiển thị owner/member role, dates và status.
- [ ] Loại bỏ planner placeholder redirect.

**Dependency:** T026, T047.
**Verify:** User chỉ thấy trips được phép và refresh giữ dữ liệu.

### T049 — Create trip form

- [ ] Tạo `/trips/new` với title, dates, description và budget.
- [ ] Client validation đồng nhất nhưng không thay server validation.
- [ ] Dùng idempotency key và disable unsafe duplicate submit.
- [ ] Redirect đến trip editor sau success.

**Dependency:** T031, T047–T048.
**Verify:** Invalid states rõ ràng; double submit không tạo duplicate.

### T050 — Trip editor shell

- [ ] Tạo `/trips/[tripId]` và protected data loading.
- [ ] Day navigation và role-aware controls.
- [ ] Not-found/forbidden/deleted states.
- [ ] Tái sử dụng UI hiện có khi phù hợp.

**Dependency:** T048–T049.
**Verify:** Owner/editor/viewer thấy đúng controls.

### T051 — Place search và add stop

- [ ] Search combobox có debounce, cancellation và retry.
- [ ] Thêm selected place snapshot vào day.
- [ ] Search provider lỗi không làm mất itinerary.

**Dependency:** T046–T050.
**Verify:** Search/add/error E2E paths đạt.

### T052 — Stop editing và ordering

- [ ] Edit notes, remove, reorder và move day.
- [ ] Accessible keyboard controls hoặc tương đương.
- [ ] Rollback/refresh an toàn khi mutation lỗi.

**Dependency:** T035, T050–T051.
**Verify:** Persisted order đúng sau reload và failure.

### T053 — Save state và conflict handling

- [ ] Hiển thị saving/saved/failed.
- [ ] Debounce autosave có sequence/version protection.
- [ ] Version conflict không ghi đè âm thầm.
- [ ] Cho reload/retry và giữ local form state khi có thể.

**Dependency:** T037–T038, T050–T052.
**Verify:** Concurrent-window E2E trả conflict và UI xử lý rõ ràng.

### T054 — Real map và route preview

- [ ] Thay fake SVG/map marker bằng map thật.
- [ ] Lazy-load map library.
- [ ] Render persisted markers và route geometry.
- [ ] Hiển thị distance/duration/source và fallback state.

**Dependency:** T046, T050–T053.
**Verify:** Journey A route path đạt; provider outage giữ được itinerary.

## Phase 9 — Collaboration

### T055 — Invitation domain và repository

- [ ] Implement invitation lifecycle và permission value.
- [ ] Generate secure raw token, chỉ persist hash.
- [ ] Enforce expiry, uniqueness và authorized inviter.
- [ ] Ghi invitation event vào outbox transactionally.

**Dependency:** T022, T032, T034.
**Verify:** Domain/repository tests cho accept/decline/revoke/expire đạt.

### T056 — Invitation/member use cases và APIs

- [ ] Implement create/view/accept/decline/revoke invitation.
- [ ] Implement change permission/remove member.
- [ ] Không log raw token/email đầy đủ.
- [ ] Revoke có hiệu lực ở request tiếp theo.

**Dependency:** T036, T038, T055.
**Verify:** HTTP/authorization matrix tests đạt.

### T057 — Collaboration web UI

- [ ] Member list và permission controls cho owner.
- [ ] Invitation creation/status UI.
- [ ] Invitation token landing/accept/decline page.
- [ ] Viewer/editor control states cập nhật đúng sau permission change.

**Dependency:** T047, T050, T056.
**Verify:** Journey C E2E đạt.

## Phase 10 — Product quality và production gate

### T058 — Analytics events

- [ ] Instrument các event đã duyệt trong Specification.
- [ ] Không gửi precise location, token hoặc unnecessary PII.
- [ ] Tránh duplicate analytics khi retry mutation.

**Dependency:** T048–T057.
**Verify:** Analytics contract/test events đúng journey.

### T059 — Accessibility và responsive pass

- [ ] Keyboard flow cho auth, form, day và stop controls.
- [ ] Labels, focus, error association và contrast cơ bản.
- [ ] Kiểm tra desktop, tablet và mobile-width web.

**Dependency:** T048–T057.
**Verify:** Automated accessibility smoke và manual critical-flow pass.

### T060 — Full automated test matrix

- [ ] Unit, integration, RLS, contract và E2E suites.
- [ ] Journey A/B/C và mandatory edge cases.
- [ ] Không tính generated Hello World tests là coverage nghiệp vụ.

**Dependency:** T023–T059.
**Verify:** Toàn bộ required suites pass từ clean environment.

### T061 — Resilience/load smoke

- [ ] Burst search/routing kiểm tra cache và rate limit.
- [ ] Core/Gateway/Geo dependency outage behavior.
- [ ] Redis restart và BullMQ job recovery.
- [ ] Outbox backlog catch-up và duplicate safety.

**Dependency:** T040–T060.
**Verify:** Kết quả nằm trong threshold được ghi lại; không mất dữ liệu/event.

### T062 — CI/CD monorepo update

- [ ] Quality gates theo affected workspace.
- [ ] Clean migration test, integration stack và E2E.
- [ ] Build/scan đúng từng image thay vì root single-image assumption.
- [ ] Giữ signing, SBOM và provenance cho published images.

**Dependency:** T014–T017, T060–T061.
**Verify:** Pull-request CI và staging pipeline pass.

### T063 — Staging deployment

- [ ] Deploy active services và web với secret manager.
- [ ] Chạy migrations theo release procedure.
- [ ] Run health/readiness và Journey A/B/C smoke.
- [ ] Xác minh metrics/logs/correlation ID.

**Dependency:** T062.
**Verify:** Staging acceptance criteria trong Specification đạt.

### T064 — Recovery và rollback rehearsal

- [ ] Test database backup/restore.
- [ ] Test application rollback không phá migration compatibility.
- [ ] Test BullMQ failed-job inspection/replay.
- [ ] Document provider outage và secret rotation runbooks.

**Dependency:** T063.
**Verify:** Recovery evidence và runbooks được review.

### T065 — Final acceptance

- [ ] Chạy lại toàn bộ Specification acceptance criteria.
- [ ] Xác nhận không có critical/high unresolved security issue.
- [ ] Xác nhận mobile không bị thay đổi.
- [ ] Cập nhật docs phản ánh implementation thật.
- [ ] Ghi known limitations và backlog cho specification tiếp theo.

**Dependency:** T064.
**Verify:** Product owner chấp nhận Gate G7; milestone có thể release production.

## 2. Thứ tự release increments

Để tránh đợi đến T065 mới có kết quả sử dụng được, implementation được chia thành
các increment có thể demo:

| Increment        | Tasks                   | Demo outcome                                 |
| ---------------- | ----------------------- | -------------------------------------------- |
| I0 Foundation    | T001–T018               | Active stack chạy bằng Docker và observable  |
| I1 Persistence   | T019–T038               | Đăng nhập, tạo/list/get/update trip thật     |
| I2 Planner       | T043–T054               | Thêm stop, reorder, map và route thật        |
| I3 Collaboration | T055–T057               | Invite và permission hoạt động               |
| I4 Durability    | T039–T042 + integration | Outbox → BullMQ → worker an toàn             |
| I5 Production    | T058–T065               | Staging accepted và recovery được kiểm chứng |

BullMQ infrastructure có thể được xây trước Geo, nhưng acceptance durability chỉ
được chốt sau khi Core Trip tạo event thật.

## 3. Quy tắc dừng và cập nhật plan

Dừng implementation và quay lại Plan/Spec khi gặp một trong các tình huống:

- Cần thay đổi service boundary hoặc data ownership.
- Cần thay đổi hành vi owner/editor/viewer đã duyệt.
- Supabase/PostgreSQL không hỗ trợ transaction/access pattern đã chọn.
- VietMap contract thực tế không đáp ứng route/search behavior trong spec.
- Redis + BullMQ không đáp ứng durability đã cam kết.
- Một dependency mới tạo ra rủi ro security/licensing/operation đáng kể.

Lỗi implementation thông thường không yêu cầu quay lại SDD; sửa trong phạm vi
task và bổ sung verification tương ứng.
