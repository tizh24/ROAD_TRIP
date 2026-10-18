# Web Backend API Integration — Specification

**Version:** 0.1.0  
**Status:** Draft — awaiting backend API contract  
**Created:** 2026-10-14  
**Constitution:** `../../architecture/constitution.md`

## 1. Mục tiêu

Người dùng web phải xác thực và sử dụng dữ liệu nghiệp vụ thông qua các public
API được backend công bố. Web không được phụ thuộc trực tiếp vào một identity
provider hoặc kho dữ liệu khác cho những hành vi mà backend đã sở hữu.

Kết quả mong muốn là một phiên đăng nhập hợp lệ từ API `/api/v1/auth/login`
cho phép người dùng sử dụng nhất quán các chức năng được backend cấp quyền.

## 2. Phạm vi

### 2.1 Xác thực và phiên người dùng

- Người dùng có thể đăng nhập bằng email và mật khẩu qua API backend.
- Sau khi đăng nhập thành công, người dùng được đưa đến URL nội bộ đã yêu cầu
  trước đó hoặc trang hồ sơ mặc định.
- Phiên còn hợp lệ phải được duy trì qua tải lại trang và được dùng cho mọi API
  cần đăng nhập.
- Khi access token hết hạn, ứng dụng cố duy trì phiên theo cơ chế backend hỗ
  trợ; nếu không thể, người dùng được thông báo rõ ràng và chuyển đến đăng
  nhập mà không mất đường dẫn cần quay lại.
- Đăng xuất phải làm phiên không còn dùng được trên web và tại backend theo
  contract được duyệt.
- Đăng nhập sai, tài khoản bị khóa hoặc lỗi dịch vụ phải có thông báo phân biệt
  được, không làm lộ mật khẩu, token hay chi tiết nội bộ.

### 2.2 Tài khoản

Web chỉ hiển thị và cung cấp các luồng đăng ký, xác nhận email, quên mật khẩu,
đặt lại mật khẩu, đổi mật khẩu và đổi tên hồ sơ khi backend đã công bố API cho
chúng. Mỗi luồng cần có trạng thái chờ, thành công, lỗi có thể khắc phục và thử
lại.

### 2.3 Các nghiệp vụ đã đăng nhập

- Mọi request đọc/ghi chuyến đi, địa điểm, tuyến đường, lời mời và thành viên
  phải gửi danh tính phiên backend hiện hành.
- UI chỉ hiển thị dữ liệu mà backend trả về và xử lý mã lỗi/quyền truy cập theo
  contract công khai.
- Khi backend từ chối quyền hoặc phiên, dữ liệu riêng tư không được tiếp tục
  hiển thị như thể người dùng vẫn được phép truy cập.

### 2.4 Rà soát toàn web

Rà soát tất cả module web, API client, route guard, callback, sign-out, profile,
analytics và fixture/test để loại bỏ các đường gọi trực tiếp đến provider cũ
trong production path. Các dependency chỉ được giữ lại nếu còn cần cho một
hành vi đã được duyệt rõ ràng.

## 3. Hành trình ưu tiên

### A — Đăng nhập và tiếp tục công việc

1. Khách mở một trang cần đăng nhập.
2. Web chuyển khách đến đăng nhập và lưu đường dẫn quay lại an toàn.
3. Khách đăng nhập với thông tin hợp lệ.
4. Web thiết lập phiên theo contract backend.
5. Khách quay về đúng trang và thực hiện được request được cấp quyền.

### B — Phiên hết hạn

1. Người dùng đang dùng chức năng cần đăng nhập.
2. Phiên truy cập hết hạn.
3. Web thử khôi phục phiên theo contract đã duyệt, tối đa trong phạm vi an toàn.
4. Nếu không khôi phục được, web yêu cầu đăng nhập lại và giữ URL quay lại.
5. Sau khi đăng nhập lại, thao tác tiếp theo dùng danh tính mới hợp lệ.

### C — Đăng xuất

1. Người dùng chọn đăng xuất.
2. Web hoàn tất hành vi đăng xuất theo backend.
3. Không request riêng tư nào tiếp theo được gửi với phiên cũ.
4. Truy cập trang bảo vệ yêu cầu đăng nhập lại.

## 4. Tiêu chí nghiệm thu

1. Tài khoản hợp lệ mà Swagger xác nhận cho `/api/v1/auth/login` đăng nhập
   được trên web.
2. Token hoặc dữ liệu nhạy cảm không xuất hiện trong UI, URL, analytics,
   console log hay error message.
3. Một request được bảo vệ từ trip, route, lời mời và profile sử dụng cùng danh
   tính backend đã đăng nhập.
4. Các trường hợp token hết hạn, refresh thất bại, logout và `401`/`403` có
   trải nghiệm rõ ràng, an toàn và không tạo vòng lặp redirect.
5. Không còn production path nào gọi trực tiếp Supabase Auth hoặc dựa vào
   Supabase session để lấy Bearer token.
6. Các API backend được dùng đều có request/response/error contract được kiểm
   chứng tự động.
7. Các journey A, B, C chạy được bằng kiểm thử end-to-end với backend mục tiêu.

## 5. Ngoài phạm vi

- Tự suy đoán hoặc tạo mới endpoint backend không có trong OpenAPI/Swagger đã
  được cung cấp.
- Thay đổi quyền nghiệp vụ, role hoặc dữ liệu backend ngoài phạm vi cần để
  hỗ trợ các contract đã duyệt.
- Chuyển đổi mobile app.

## 6. Điều kiện để lập Technical Plan

Contract backend cần được cung cấp/duyệt cho các endpoint sau, gồm body,
response, mã lỗi, yêu cầu role và vòng đời token:

- Login, refresh, logout và endpoint identity hiện hành.
- Đăng ký/xác nhận email, quên/đặt lại/đổi mật khẩu và cập nhật profile, nếu
  các màn hình tương ứng vẫn được giữ.
- Danh sách endpoint nghiệp vụ hiện có cho trips, places/routes, invitations,
  members và profile.

Contract `/api/v1/auth/login` quan sát từ Swagger trả envelope
`{ success, data: { accessToken, refreshToken, tokenType }, error }`. Contract
này khác với Gateway trong repository hiện tại, vốn chỉ công bố `/api/v1/me`
và xác thực JWT do Supabase cấp. Cần xác nhận backend Swagger là backend mục
tiêu và cung cấp OpenAPI/Swagger export trước khi quyết định cơ chế tương thích
và migration.

## 7. Kết quả rà soát ban đầu

Các production path hiện còn dùng Supabase trực tiếp: login, sign-up,
password reset/update, profile-name update, route authorization, auth callback,
sign-out, proxy session refresh, Gateway token acquisition và profile settings.
Trip, place, route, invitation và membership đã dùng Gateway nhưng hiện lấy
access token từ Supabase session, nên phải được chuyển cùng auth session mới.
