import Link from "next/link";
import { Compass } from "lucide-react";
import { footerLinks } from "./content";

const columns = [
  { title: "Sản phẩm", links: footerLinks.product },
  { title: "Tài khoản", links: footerLinks.account },
  { title: "Hỗ trợ khi đi đường", links: footerLinks.roadside },
] as const;

export default function LandingFooter() {
  return (
    <footer className="border-t border-border-main bg-background">
      <div className="page-shell grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Link href="/" className="focus-ring inline-flex items-center gap-3 rounded-lg" aria-label="Tripz, về trang chủ">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-strong text-white">
              <Compass size={20} aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-secondary">Tripz</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-7 text-text-sub">
            Công cụ lên kế hoạch và lưu lại những chuyến đi đường dài ở Việt Nam.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-sm font-extrabold text-text-main">{column.title}</h2>
            <ul className="mt-3 grid gap-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="focus-ring inline-flex min-h-11 items-center rounded text-sm text-text-sub hover:text-secondary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="page-shell border-t border-border-main py-6 text-xs text-text-sub">
        © 2026 Tripz. Thông tin tuyến đường chỉ mang tính tham khảo; hãy kiểm tra điều kiện đường trước khi khởi hành.
      </p>
    </footer>
  );
}
