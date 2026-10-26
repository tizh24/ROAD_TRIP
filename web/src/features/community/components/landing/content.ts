// Single source of Vietnamese landing content. Every destination below maps to
// a route that exists today; nothing here asserts metrics, ratings or people.
// Destination photos are stock placeholders: replace them with owned photography
// of the named place, and keep each alt text describing what the photo shows.

export const landingNav = [
  { href: "#diem-den", label: "Điểm đến" },
  { href: "#cach-hoat-dong", label: "Cách hoạt động" },
  { href: "/explore", label: "Khám phá" },
  { href: "/feed", label: "Cộng đồng" },
] as const;

export const landingRoutes = {
  plan: "/trips/new",
  explore: "/explore",
  login: "/login",
  signup: "/signup",
  dashboard: "/dashboard",
} as const;

export const valueItems = [
  {
    title: "Lập tuyến đường theo từng ngày",
    text: "Tìm địa điểm, thêm điểm dừng vào từng ngày, sắp xếp lại thứ tự và xem quãng đường, thời gian ước tính trên bản đồ.",
  },
  {
    title: "Cùng lên kế hoạch",
    text: "Mời bạn đồng hành bằng email với quyền chỉ xem hoặc được chỉnh sửa. Chủ chuyến đi luôn kiểm soát ai được làm gì.",
  },
  {
    title: "Sẵn sàng khi đã lên đường",
    text: "Chế độ đi đường liệt kê các chặng, mở chỉ đường cho từng điểm dừng và có sẵn số khẩn cấp 113, 115, 116.",
  },
  {
    title: "Lưu lại và chia sẻ",
    text: "Ghi chi tiêu, thêm ảnh vào nhật ký chuyến đi và chọn chia sẻ riêng tư, qua liên kết hoặc công khai với cộng đồng.",
  },
] as const;

export const destinations = [
  {
    query: "Sa Pa",
    name: "Sa Pa",
    region: "Tây Bắc",
    image:
      "https://images.unsplash.com/photo-1540611025311-01df3cef54b5?q=80&w=1200&auto=format&fit=crop",
    alt: "Khinh khí cầu bay trên rừng núi phủ sương",
    wide: true,
  },
  {
    query: "Hội An",
    name: "Hội An",
    region: "Miền Trung",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1000&auto=format&fit=crop",
    alt: "Món nướng bày trên bàn ăn",
    wide: false,
  },
  {
    query: "Ninh Bình",
    name: "Ninh Bình",
    region: "Đồng bằng sông Hồng",
    image:
      "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1000&auto=format&fit=crop",
    alt: "Thuyền trên mặt nước giữa các đảo đá vôi",
    wide: false,
  },
  {
    query: "Nha Trang",
    name: "Nha Trang",
    region: "Nam Trung Bộ",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    alt: "Bờ biển lúc hoàng hôn với nước trong xanh",
    wide: true,
  },
] as const;

export const planSteps = [
  {
    title: "Chọn một cung đường",
    text: "Nhân bản một lộ trình công khai từ cộng đồng hoặc bắt đầu một chuyến đi trống với ngày đi và ngân sách của bạn.",
  },
  {
    title: "Chỉnh lịch trình cùng nhau",
    text: "Thêm điểm dừng, ghi chú, đổi thứ tự hoặc chuyển sang ngày khác. Mỗi thay đổi đều có trạng thái lưu rõ ràng.",
  },
  {
    title: "Đi và lưu kỷ niệm",
    text: "Đánh dấu từng chặng đã tới, hoàn tất chuyến đi rồi gom ảnh và chi tiêu vào một nhật ký.",
  },
] as const;

export const footerLinks = {
  product: [
    { href: "/trips/new", label: "Lên kế hoạch" },
    { href: "/explore", label: "Khám phá lộ trình" },
    { href: "/feed", label: "Cộng đồng" },
  ],
  account: [
    { href: "/login", label: "Đăng nhập" },
    { href: "/signup", label: "Tạo tài khoản" },
    { href: "/partner/register", label: "Trở thành đối tác" },
  ],
  roadside: [
    { href: "tel:113", label: "113 · Công an / CSGT" },
    { href: "tel:115", label: "115 · Cấp cứu y tế" },
    { href: "tel:116", label: "116 · Cứu hộ đường bộ" },
  ],
} as const;
