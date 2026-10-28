import {
  BarChart3,
  BookOpen,
  Compass,
  CreditCard,
  FolderHeart,
  LayoutDashboard,
  Link2,
  Map,
  Megaphone,
  Settings,
  ShieldAlert,
  Star,
  Store,
  Users,
  UserRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match only the exact path (used for section roots such as /admin). */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface ShellConfig {
  /** Short name of the area, shown under the brand and used in landmarks. */
  area: string;
  groups: NavGroup[];
  /** Label for the first breadcrumb. */
  rootLabel: string;
  /** Primary action shown in the header, if the role has one. */
  action?: { label: string; href: string };
}

export const travelerShell: ShellConfig = {
  area: "Khách đi đường",
  rootLabel: "Tripz",
  action: { label: "Tạo chuyến đi", href: "/planner/new" },
  groups: [
    {
      label: "Hành trình",
      items: [
        { label: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
        { label: "Chuyến đi", href: "/trips", icon: Map },
        { label: "Sổ tay du lịch", href: "/travel-book", icon: BookOpen },
      ],
    },
    {
      label: "Khám phá",
      items: [
        { label: "Khám phá", href: "/explore", icon: Compass },
        { label: "Cộng đồng", href: "/feed", icon: Users },
      ],
    },
    {
      label: "Tài khoản",
      items: [
        { label: "Hồ sơ", href: "/profile", icon: UserRound, exact: true },
        { label: "Bộ sưu tập", href: "/profile/collections", icon: FolderHeart },
        { label: "Thanh toán", href: "/profile/billing", icon: CreditCard },
        { label: "Cài đặt", href: "/profile/settings", icon: Settings },
      ],
    },
  ],
};

export const partnerShell: ShellConfig = {
  area: "Đối tác",
  rootLabel: "Đối tác",
  groups: [
    {
      label: "Kinh doanh",
      items: [
        { label: "Tổng quan", href: "/partner", icon: Store, exact: true },
        { label: "Chiến dịch", href: "/partner/campaigns", icon: Megaphone },
        { label: "Đánh giá", href: "/partner/reviews", icon: Star },
        { label: "Phân tích", href: "/partner/analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Tài khoản",
      items: [{ label: "Thanh toán", href: "/partner/billing", icon: CreditCard }],
    },
  ],
};

export const adminShell: ShellConfig = {
  area: "Quản trị",
  rootLabel: "Quản trị",
  groups: [
    {
      label: "Vận hành",
      items: [
        { label: "Tổng quan", href: "/admin", icon: LayoutDashboard, exact: true },
        { label: "Kiểm duyệt", href: "/admin/moderation", icon: ShieldAlert },
        { label: "Đối tác", href: "/admin/partners", icon: Users },
      ],
    },
    {
      label: "Doanh thu",
      items: [
        { label: "Liên kết tiếp thị", href: "/admin/affiliates", icon: Link2 },
        { label: "Tài chính", href: "/admin/finance", icon: CreditCard },
      ],
    },
    {
      label: "Hệ thống",
      items: [{ label: "Cấu hình", href: "/admin/settings", icon: Settings }],
    },
  ],
};

export function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Label for the current page: the longest nav item that matches the path. */
export function currentItem(pathname: string, config: ShellConfig) {
  let best: NavItem | undefined;
  for (const group of config.groups) {
    for (const item of group.items) {
      if (isActive(pathname, item) && (!best || item.href.length > best.href.length)) best = item;
    }
  }
  return best;
}
