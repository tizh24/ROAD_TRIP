"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, LogOut, Menu, Plus, UserRound } from "lucide-react";
import { Button } from "./button";
import SearchBar from "./SearchBar";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./sheet";

type NavbarUser = {
  email?: string;
  platformRole?: "USER" | "PARTNER" | "MODERATOR" | "ADMIN";
};

const navLinks = [
  { href: "/", label: "Trang chủ" },
  { href: "/explore", label: "Khám phá" },
  { href: "/feed", label: "Cộng đồng" },
] as const;

export default function Navbar({ user }: { user?: NavbarUser }) {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="page-shell mx-auto flex min-h-16 items-center justify-between gap-4">
        <Link href="/" className="focus-ring shrink-0 rounded text-lg font-semibold tracking-tight">
          Tripz
        </Link>

        <div className="hidden max-w-md flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring inline-flex min-h-11 items-center rounded-md px-3 text-sm transition-colors ${isActive ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden min-h-11 sm:inline-flex">
            <Link href="/planner/new">
              <Plus aria-hidden="true" /> Tạo lộ trình
            </Link>
          </Button>

          {user ? (
            <>
              <Button asChild variant="outline" className="hidden min-h-11 sm:inline-flex">
                <Link href="/profile" title="Hồ sơ cá nhân">
                  <UserRound aria-hidden="true" /> Hồ sơ
                </Link>
              </Button>
              <form action="/auth/signout" method="post" className="hidden sm:block">
                <Button type="submit" variant="ghost" size="icon" className="size-11" title="Đăng xuất">
                  <LogOut aria-hidden="true" />
                  <span className="sr-only">Đăng xuất</span>
                </Button>
              </form>
            </>
          ) : (
            <Button asChild variant="outline" className="hidden min-h-11 sm:inline-flex">
              <Link href="/login" title="Đăng nhập">
                <LogIn aria-hidden="true" /> Đăng nhập
              </Link>
            </Button>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className="size-11 lg:hidden" aria-label={mobileOpen ? "Đóng điều hướng" : "Mở điều hướng"}>
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,100vw)]">
              <SheetHeader>
                <SheetTitle>Điều hướng</SheetTitle>
                <SheetDescription className="sr-only">Các trang chính của Tripz</SheetDescription>
              </SheetHeader>
              <nav className="grid gap-1 px-4" aria-label="Điều hướng di động">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileOpen(false)}
                      className={`focus-ring flex min-h-12 items-center rounded-md px-3 text-base ${isActive ? "bg-muted font-medium" : "hover:bg-muted"}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-4 grid gap-2 px-4">
                <Button asChild className="min-h-11">
                  <Link href="/trips/new" onClick={() => setMobileOpen(false)}>
                    <Plus aria-hidden="true" /> Tạo chuyến đi
                  </Link>
                </Button>
                {user ? (
                  <>
                    <Button asChild variant="outline" className="min-h-11">
                      <Link href="/profile" onClick={() => setMobileOpen(false)}>
                        <UserRound aria-hidden="true" /> Hồ sơ
                      </Link>
                    </Button>
                    <form action="/auth/signout" method="post" onSubmit={() => setMobileOpen(false)}>
                      <Button type="submit" variant="ghost" className="min-h-11 w-full">
                        <LogOut aria-hidden="true" /> Đăng xuất
                      </Button>
                    </form>
                  </>
                ) : (
                  <Button asChild variant="outline" className="min-h-11">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <LogIn aria-hidden="true" /> Đăng nhập
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
