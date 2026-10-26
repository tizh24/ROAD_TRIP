"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Compass, Menu, X } from "lucide-react";
import { landingNav, landingRoutes } from "./content";

export default function LandingHeader({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);
  const accountLink = signedIn
    ? { href: landingRoutes.dashboard, label: "Chuyến đi của tôi" }
    : { href: landingRoutes.login, label: "Đăng nhập" };

  return (
    <header className="border-b border-border-main bg-background">
      <div className="page-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label="Tripz, về trang chủ">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-strong text-white">
            <Compass size={20} aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-[-0.04em] text-secondary">Tripz</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {landingNav.map((link) => (
            <Link key={link.href} href={link.href} className="focus-ring inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-bold text-text-sub hover:text-secondary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={accountLink.href} className="focus-ring hidden min-h-11 items-center rounded-lg px-4 text-sm font-bold text-text-main hover:bg-background-warm sm:inline-flex">
            {accountLink.label}
          </Link>
          <Link href={landingRoutes.plan} className="focus-ring hidden min-h-11 items-center rounded-lg bg-primary-strong px-5 text-sm font-bold text-white hover:bg-primary-strong/90 sm:inline-flex">
            Bắt đầu lên kế hoạch
          </Link>
          <button
            ref={menuButton}
            type="button"
            className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-main hover:bg-background-warm lg:hidden"
            aria-label={open ? "Đóng điều hướng" : "Mở điều hướng"}
            aria-expanded={open}
            aria-controls="landing-mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="landing-mobile-nav" aria-label="Điều hướng di động" className="border-t border-border-main px-4 pb-5 pt-3 lg:hidden">
          <ul className="page-shell grid gap-1">
            {landingNav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={close} className="focus-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-text-main hover:bg-background-warm">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={accountLink.href} onClick={close} className="focus-ring flex min-h-11 items-center rounded-lg px-3 text-sm font-bold text-text-main hover:bg-background-warm">
                {accountLink.label}
              </Link>
            </li>
            <li>
              <Link href={landingRoutes.plan} onClick={close} className="focus-ring mt-2 flex min-h-11 items-center justify-center rounded-lg bg-primary-strong px-4 text-sm font-bold text-white hover:bg-primary-strong/90">
                Bắt đầu lên kế hoạch
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
