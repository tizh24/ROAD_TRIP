# Road Trip Platform API Contract — Specification

**Status:** Draft  
**Created:** 2026-10-14  
**Constitution:** `../../architecture/constitution.md`

## 1. Mục tiêu

Web và các client tương lai sử dụng public API versioned của Road Trip Gateway
cho mọi hành vi sản phẩm. Supabase giữ vai trò identity provider; Gateway là
BFF công khai cho registration, session, profile và các bounded context của
platform.

## 2. Identity và role

Supabase JWT claim `role=authenticated` chỉ biểu thị phiên hợp lệ. Nó không
phải platform role và không được dùng để quyết định quyền `ADMIN` hoặc
`PARTNER`.

Platform role được xác định server-side từ profile/authorization data:

| Role | Quyền platform |
| --- | --- |
| Guest | Public discovery và auth flows; không truy cập dữ liệu riêng tư. |
| User | Profile cá nhân, trip, invitations và community theo policy resource. |
| Partner | Tất cả quyền User, cộng thêm tài nguyên partner thuộc quyền sở hữu. |
| Admin | Operations, moderation, partner approval và audit theo policy; không mặc định đọc private trip. |

Trip sử dụng resource permission độc lập:

| Permission | Quyền trip |
| --- | --- |
| Owner | Quản lý trip, itinerary, member và invitation. |
| Editor | Xem và sửa itinerary; không quản lý member hoặc xóa trip. |
| Viewer | Chỉ xem. |

Người dùng không bao giờ thay platform role qua profile API. Chỉ admin operation
được audit mới được thay role hoặc trạng thái account.

## 3. API capability bắt buộc

### 3.1 Session BFF

- Register, login, refresh, logout và current-session identity.
- Email confirmation, password reset và password change.
- Session token chỉ tồn tại trong secure HttpOnly cookie; browser code không đọc
  access token hoặc refresh token.
- OAuth callback phải an toàn với state/PKCE và return path nội bộ hợp lệ.

### 3.2 Account và profile

- Đọc/sửa profile presentation fields, account status và notification settings.
- Admin quản lý platform role/status có audit trail.

### 3.3 Trips và geo

- Hiện có: trip, day, stop, optimistic version, invitation/member, place search
  và route preview.
- Contract phải mô tả đủ input/output schema, permissions, pagination,
  idempotency và stable errors cho mọi operation hiện có.

### 3.4 Road-trip execution

- Check-in, expense và memory phải có lifecycle, quyền theo trip, retention và
  delete/export semantics trước khi có endpoint.

### 3.5 Community, partner và monetization

- Community: public profile, feed, post, comment, review, moderation và social
  graph.
- Partner: organization/profile, listing/store, campaign, analytics và review
  response.
- Monetization: subscription, invoice, affiliate và payment webhook. Payment
  state chỉ thay đổi qua verified provider event; retry phải idempotent.

### 3.6 Media và notification

- Upload phải được authorize trước khi cấp signed URL; MIME, size, ownership và
  completion phải được kiểm tra.
- Notification API gồm inbox, read state và preference; worker không được expose
  như public API.

## 4. Contract requirements

Mỗi public endpoint phải có OpenAPI schema cho request/success/error, auth,
platform role, resource permission, pagination/idempotency/concurrency khi phù
hợp. Success envelope và error envelope phải thống nhất; Swagger không được
chỉ trả `object` hoặc empty response cho public resource.

## 5. Acceptance criteria

1. Browser không gọi Supabase Auth/Data API trực tiếp trong production path.
2. Gateway BFF hoàn thành email/password session flow bằng secure cookie.
3. Mọi endpoint có role/resource permission rõ trong OpenAPI và server-side
   authorization test.
4. User không thể tự nâng `USER` thành `PARTNER`/`ADMIN`.
5. Owner/editor/viewer authorization không bị platform role làm suy yếu.
6. API hiện có của active trip planner được mô tả bằng schema đầy đủ và web
   client contract tests.
7. Community, monetization, execution, media và notification chỉ được triển
   khai sau khi specification domain tương ứng được duyệt.
