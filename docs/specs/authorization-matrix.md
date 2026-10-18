# Platform Authorization and Capability Matrix

## 1. Principles and Separation of Concerns

1. **Platform Roles vs. Resource Permissions**:
   - Platform roles (`USER`, `PARTNER`, `MODERATOR`, `ADMIN`) define platform-wide access, account capabilities, and administrative boundaries.
   - Trip-member permissions (`OWNER`, `EDITOR`, `VIEWER`) are trip-scoped, managed independently by the Core Trip service, and NEVER grant platform administration.
2. **Platform Role vs. Partner Business State**:
   - Partner application status (`NONE`, `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) is a distinct business lifecycle state, not a platform role. A user with a pending partner application remains a `USER` until approved by an administrator.
3. **Capability-Based Authorization**:
   - Services and routes check explicit fine-grained capabilities (e.g. `partner.listing.write`, `admin.role.grant`, `content.moderation.execute`) rather than hardcoding exact role checks, preventing privilege creep and enabling modular role expansion.
4. **Standard Error and Concealment Policy**:
   - `401 Unauthorized`: Unauthenticated guest requests protected route or resource (`AUTH_REQUIRED` / redirect to `/login?next={safeCurrentUrl}`).
   - `403 Forbidden`: Authenticated user lacks the required capability (`FORBIDDEN` / render `/forbidden` page).
   - `404 Concealed Not Found`: Accessing a private trip or non-existent resource returns 404 (`TRIP_NOT_FOUND`) to outsiders/guests to prevent leaking the existence of private resources.

---

## 2. Platform Role & Capability Matrix

| Capability | Description | Guest | User | Partner | Moderator | Admin |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| `public.trip.read` | Read published trips and routes | ✅ | ✅ | ✅ | ✅ | ✅ |
| `profile.read` | Read caller's authenticated profile | ❌ | ✅ | ✅ | ✅ | ✅ |
| `profile.update_self` | Update presentation fields (name, avatar) | ❌ | ✅ | ✅ | ✅ | ✅ |
| `trip.create` | Create personal draft trips | ❌ | ✅ | ✅ | ✅ | ✅ |
| `trip.clone` | Clone a published trip to personal draft | ❌ | ✅ | ✅ | ✅ | ✅ |
| `partner.access` | Access partner workspace (`/partner/**`) | ❌ | ❌ | ✅ | ❌ | ✅ |
| `partner.listing.read` | View owned partner listings | ❌ | ❌ | ✅ | ❌ | ✅ |
| `partner.listing.write` | Create / edit / publish partner listings | ❌ | ❌ | ✅ | ❌ | ✅ |
| `partner.analytics.read`| View partner performance analytics | ❌ | ❌ | ✅ | ❌ | ✅ |
| `content.moderation.read` | View flagged content & report queue | ❌ | ❌ | ❌ | ✅ | ✅ |
| `content.moderation.execute` | Resolve, dismiss, or censor reports | ❌ | ❌ | ❌ | ✅ | ✅ |
| `admin.access` | Access administrative portal (`/admin/**`) | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin.user.read` | Read platform user profiles & status | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin.role.grant` | Grant / revoke platform roles (audited) | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin.status.update` | Ban / unban / deactivate accounts (audited) | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin.partner.approve` | Approve / reject partner applications | ❌ | ❌ | ❌ | ❌ | ✅ |
| `admin.audit.read` | Read immutable platform audit logs | ❌ | ❌ | ❌ | ❌ | ✅ |

> [!IMPORTANT]
> A `MODERATOR` may moderate community content, but CANNOT grant or revoke roles, manage financial ledgers, or alter system configurations.

---

## 3. Trip Resource Permission Matrix

Trip permissions are evaluated per-trip by Core Trip Service:

| Trip Action | Owner | Editor (`EDIT`) | Viewer (`VIEW`) | Outsider / Non-member |
| :--- | :---: | :---: | :---: | :---: |
| `READ` (private trip) | ✅ 200 | ✅ 200 | ✅ 200 | ❌ **404 Concealed** |
| `READ` (published trip) | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 (Public Read) |
| `EDIT_ITINERARY` (stops/days) | ✅ 200 | ✅ 200 | ❌ 403 Forbidden | ❌ **404 Concealed** |
| `MANAGE_TRIP` (title/dates/budget) | ✅ 200 | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ **404 Concealed** |
| `MANAGE_MEMBERS` (invitations/roles) | ✅ 200 | ❌ 403 Forbidden | ❌ 403 Forbidden | ❌ **404 Concealed** |

---

## 4. Web Surface Routing & Access Matrix

| Route | Guest | User | Partner | Moderator | Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `/`, `/explore`, `/trip/:id` (published) | 200 | 200 | 200 | 200 | 200 |
| `/trip/:id` (private) | 404 | 404 (if outsider) | 404 (if outsider) | 404 (if outsider) | 404 (if outsider) |
| `/dashboard`, `/planner/**` | Redirect `/login` | 200 | 200 | 200 | 200 |
| `/profile/settings` | Redirect `/login` | 200 | 200 | 200 | 200 |
| `/partner/**` | Redirect `/login` | Redirect `/partner/register` | 200 | Redirect `/partner/register` | 200 |
| `/admin/**` | Redirect `/login` | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** | 200 |
