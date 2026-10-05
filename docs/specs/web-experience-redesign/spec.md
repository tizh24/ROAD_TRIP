# Web Experience Redesign — Specification

**Version:** 0.1.0  
**Status:** Approved  
**Approved:** 2026-10-05  
**Created:** 2026-10-05  
**Target:** Responsive web (mobile-first, tablet, desktop)

## 1. Mục tiêu

Thiết kế lại toàn bộ trải nghiệm web Road Trip thành một sản phẩm du lịch phiêu lưu hiện đại, nhất quán từ lúc khám phá đến khi lên kế hoạch, di chuyển, lưu giữ kỷ niệm, chia sẻ cộng đồng và sử dụng cổng đối tác/quản trị.

Người dùng phải luôn hiểu rõ: họ đang ở đâu trong hành trình, dữ liệu nào là của họ, thao tác nào đang được lưu và bước tiếp theo có giá trị nhất.

## 2. Định hướng thị giác

- Phong cách **Modern Travel / Adventure**: ấm áp, giàu cảm giác khám phá, không mang dáng dấp dashboard corporate.
- Nền sáng trung tính (sand/cream); màu nhấn là cam cháy nắng, xanh lá rừng và vàng đất. Màu trạng thái phải dễ phân biệt, không chỉ dựa vào màu.
- Heading tròn, thân thiện (Poppins hoặc DM Sans); body font đơn giản, dễ đọc; không dùng serif cứng.
- Ảnh địa điểm/chuyến đi lớn, full-bleed trong thẻ có gradient bảo đảm chữ đủ tương phản. Không dùng ảnh để che thông tin nghiệp vụ quan trọng.
- Card grid cho nội dung khám phá và lập kế hoạch; map là canvas chính của module đang đi; Memory theo timeline/story; Community là social feed giàu ảnh và social proof.

Các tham chiếu định hướng: Airbnb (card/filter/trust), Komoot và AllTrails (map/outdoor), Strava (community/activity), Roadtrippers (road-trip planning), Polarsteps (travel journal). Đây là tham chiếu UX/thẩm mỹ, không sao chép tài sản, câu chữ hay nhận diện của họ.

## 3. Personas và khu vực sản phẩm

| Persona | Mục tiêu chính | Khu vực web |
| --- | --- | --- |
| Khách | Khám phá, đánh giá giá trị, bắt đầu đăng nhập | Public, Explore, trip công khai |
| Traveler | Lập kế hoạch, cộng tác, đi đường, lưu kỷ niệm, chia sẻ | Trip, Planner, On-the-road, Memory, Community, Profile |
| Partner | Theo dõi hiệu quả hiện diện/campaign | Partner portal |
| Admin | Điều hành, kiểm duyệt, quản lý đối tác/doanh thu | Admin portal |

## 4. Nguyên tắc trải nghiệm chung

1. Mobile-first; thao tác quan trọng chạm một tay và vẫn hoạt động bằng bàn phím trên desktop.
2. Điều hướng theo ngữ cảnh: public, traveler, partner và admin không được lẫn quyền hoặc điểm đến.
3. Mỗi màn hình có loading, empty, error, permission denied và retry; dữ liệu mẫu luôn gắn nhãn demo.
4. Form dài chia bước, lưu nháp rõ ràng và không làm mất dữ liệu khi lỗi mạng hoặc xác thực hết hạn.
5. Ảnh, map và bảng số liệu tải dần; nội dung chính luôn có skeleton hoặc fallback hữu ích.
6. Hành động phá huỷ cần xác nhận; thay đổi có thể hoàn tác khi phù hợp.
7. GPS, thành viên trip, ảnh riêng tư và thanh toán không công khai theo mặc định.

## 5. Luồng và màn hình cần thiết kế

### 5.1 Public discovery

- **Trang chủ:** hero ảnh road-trip Việt Nam, tìm kiếm/CTA tạo chuyến đi, điểm đến nổi bật, trip truyền cảm hứng, lợi ích và social proof.
- **Explore:** tìm kiếm, filter chips/bottom sheet trên mobile, sắp xếp, card ảnh lớn, map/list toggle và chi tiết kết quả.
- **Trip công khai:** hero ảnh, tuyến/dừng chân, bản đồ, lịch trình theo ngày, tác giả, review/hoạt động cộng đồng và CTA clone/save trip.

### 5.2 Identity và onboarding

- **Đăng nhập/đăng ký:** giá trị sản phẩm, phương thức xác thực, lỗi có thể khắc phục, callback state và quay lại đúng ngữ cảnh bị ngắt.
- **Onboarding lần đầu:** tên/ảnh đại diện tối thiểu, ưu tiên du lịch và CTA tạo hoặc khám phá trip; cho phép bỏ qua dữ liệu không bắt buộc.
- **Session/access states:** hết phiên, không đủ quyền, liên kết mời hết hạn và not-found đều chỉ rõ lựa chọn tiếp theo.

### 5.3 Trip planning và cộng tác

- **My Trips:** trip sắp tới/đã hoàn thành, tìm kiếm/filter, card có ảnh-ngày-thành viên-trạng thái-quick action; empty state dẫn tới tạo trip.
- **Tạo trip:** 3 bước: cảm hứng/tên & cover → ngày & ngân sách → xác nhận; preview journey và validation tại chỗ.
- **Trip overview:** cover, tiến độ, ngày đi, thành viên, budget, itinerary preview, recent activity và entry point sang planner.
- **Planner:** desktop chia panel itinerary + map; mobile ưu tiên itinerary với map drawer/fullscreen. Có day tabs, place search, stop cards, reorder/move, route summary, ghi chú, autosave/retry/conflict.
- **Cộng tác:** thành viên, avatar cluster, lời mời, quyền xem/chỉnh sửa, pending invitation và activity; người chỉ xem biết rõ lý do không thể sửa.
- **Lifecycle:** chỉnh sửa, rời trip, archive/xóa theo quyền; destructive flows có xác nhận và kết quả rõ ràng.

### 5.4 On-the-road

- **Trip live map:** map full canvas, route, điểm dừng và vị trí nhóm khi được đồng thuận; floating controls, tiến độ ngày và CTA check-in.
- **Điều hướng/ngày hiện tại:** next stop, ETA/khoảng cách, danh sách chặng, cảnh báo kết nối và fallback khi map/location lỗi.
- **Check-in & safety:** sheet xác nhận, phạm vi chia sẻ nhóm, offline/sync state và SOS chỉ khi sản phẩm hỗ trợ.

### 5.5 Memory và community

- **Trip memory:** timeline theo ngày/địa điểm, entry ảnh/video/note, story hero, visibility, thêm/chỉnh/sắp xếp/xóa và empty state.
- **Memory detail/share:** story immersive, reactions/comments khi được bật, link share/preview và privacy rõ ràng.
- **Community feed:** composer, feed card (ảnh, hoạt động trip, tác giả, location, social proof), reactions/comments/save/report; filter chủ đề/địa điểm.
- **Post detail & challenge:** xem, bình luận, báo cáo, tham gia/xem kết quả challenge và moderation states.

### 5.6 Profile, preferences và billing

- **Profile:** identity, trip/memory công khai, achievement/travel stats và edit theo quyền xem.
- **Settings:** account, notification, privacy/location, connected services, export/delete account; hành động nhạy cảm có hậu quả và xác nhận.
- **Billing:** plan, usage/benefits, payment method, invoice/history, nâng/hạ/gia hạn/hủy minh bạch.

### 5.7 Partner portal

- **Overview:** KPI có ngữ cảnh, campaign nổi bật, recent reviews, quick actions.
- **Campaigns:** danh sách/filter, tạo-sửa, preview placement, ngân sách/trạng thái và empty/error.
- **Analytics:** performance theo thời gian, biểu đồ/tooltip, filter, export và giải thích chỉ số.
- **Reviews & billing:** inbox review/response, invoices, payment method và charge/payout state.

### 5.8 Admin portal

- **Overview:** health/KPI, việc cần xử lý, trend và lối tắt.
- **Moderation:** queue report, chi tiết/ngữ cảnh, approve/remove/escalate, audit state và empty queue.
- **Partners, affiliates, finance, settings:** list/detail/form/table, filter, export, permission guard, audit confirmation và load/save failure.

## 6. Hệ thống thành phần bắt buộc

- App shell, responsive nav, breadcrumbs, page header, command/search entry.
- Buttons, inputs, select/combobox, date picker, tabs, chips/filter, tooltip, badge, toast, dialog/drawer/bottom sheet và stepper.
- Trip/place/feed/memory/metric cards; avatar/cluster; empty state; skeleton; error/retry panel; permission guard.
- Map controls, marker/tooltip, route summary và location-consent prompt.
- Token màu, typography, spacing, elevation, radius, breakpoint, icon, motion và focus/disabled/selected/destructive states.

## 7. Responsive, accessibility và content

- Hỗ trợ 320px đến desktop rộng; grid/card reflow, sidebar thành drawer/bottom sheet trên mobile.
- Đạt WCAG 2.2 AA: contrast, focus, keyboard, semantic labels và thông báo trạng thái động. Không dùng hover làm cách duy nhất để lộ hành động.
- Motion chỉ hỗ trợ định hướng/chuyển ngữ cảnh và tôn trọng reduced motion.
- Nội dung tiếng Việt là chuẩn, sẵn sàng bản địa hóa. Ảnh có alt text theo ngữ cảnh.

## 8. Tiêu chí chấp nhận thiết kế

1. Prototype/wireflow bao phủ toàn bộ luồng mục 5 và liên kết được các điểm quyết định chính.
2. Mỗi màn hình có desktop, mobile, loading, empty, error và permission state.
3. Design system mục 6 được tái sử dụng nhất quán, có token và accessibility states.
4. Planner/On-the-road map-centric nhưng itinerary vẫn thao tác được; Memory là story/timeline; Community là social feed.
5. Quyền riêng tư/quyền truy cập thể hiện trước khi chia sẻ location, memory, community content hoặc thanh toán.
6. Không ngụ ý rằng dữ liệu demo là dữ liệu thật.

## 9. Prompt foundation cho Google Stitch

> Design a responsive web app called “Road Trip” for Vietnam adventure travel. Create a warm Modern Travel/Adventure visual system: cream/sand background, burnt-orange sun, forest-green and ochre accents; friendly rounded headings in Poppins or DM Sans; readable sans-serif body. Use cinematic, full-bleed Vietnam road-trip photography with accessible contrast. Build a reusable mobile-first design system. Use image-led cards for discovery and trip planning, a map-first trip-on-the-road interface with floating controls, a chronological travel-story timeline for memories, and a Strava-like social community feed. Design public, traveler, partner, and admin flows, including loading, empty, error, retry, permission and destructive-confirmation states. Do not copy reference brands or logos. Prioritize accessibility and clear privacy consent for location, photos and sharing.

## 10. Assumptions awaiting approval

1. “Tất cả các luồng web” gồm public, traveler, partner và admin; mobile native không thuộc đợt redesign này.
2. On-the-road, Memory, Community, billing và safety được thiết kế đầy đủ về UX nhưng chỉ triển khai khi backend capability tương ứng đã sẵn sàng.
3. Google Stitch là công cụ tạo/khám phá design concept; output phải được rà soát trước khi trở thành source of truth hoặc mã nguồn.
4. Brand name hiện tại là Road Trip và thị trường mặc định là Việt Nam.
