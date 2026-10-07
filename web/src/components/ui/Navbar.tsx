"use client";
import React, { useState } from "react";
import CTAButton from "./CTAButton";
import SearchBar from "./SearchBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Map, Users, Plus, Menu, X, LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: <Compass size={16} /> },
    { href: "/explore", label: "Khám phá", icon: <Map size={16} /> },
    { href: "/feed", label: "Cộng đồng", icon: <Users size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full border-b border-border-light bg-background/95 font-sans">
      <div className="page-shell min-h-[72px] mx-auto flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer shrink-0 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-card transition-transform group-hover:-translate-y-0.5"><Compass size={20} /></div>
          <span className="font-display text-xl font-extrabold tracking-[-0.045em] text-secondary">TripZ</span>
        </Link>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <SearchBar onSearch={(val) => console.log(val)} />
        </div>

        {/* Center-Right: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-2" aria-label="Điều hướng chính">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 text-sm font-bold rounded-xl flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-text-sub hover:bg-background-warm hover:text-secondary"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side: CTA Button */}
        <div className="flex items-center gap-4">
          <Link href="/trips/new">
            <CTAButton 
              variant="primary" 
              size="sm" 
              className="hidden items-center gap-2 py-2.5 sm:flex"
            >
              <Plus size={16} /> Tạo Lộ Trình
            </CTAButton>
          </Link>
          
          <Link href="/login" className="focus-ring hidden shrink-0 items-center gap-2 rounded-lg border border-border-main bg-surface px-3 py-2 text-sm font-bold text-text-main hover:bg-background-warm sm:inline-flex" title="Đăng nhập">
            <LogIn size={16} aria-hidden="true" /> Đăng nhập
          </Link>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-text-main hover:bg-background-warm lg:hidden"
            aria-label={mobileOpen ? "Đóng điều hướng" : "Mở điều hướng"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

      </div>
      {mobileOpen ? (
        <div className="border-t border-border-light bg-background px-4 pb-5 pt-3 lg:hidden">
          <nav className="page-shell grid gap-1" aria-label="Điều hướng di động">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`focus-ring flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold ${isActive ? "bg-secondary/10 text-secondary" : "text-text-main hover:bg-background-warm"}`}>
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            <Link href="/trips/new" onClick={() => setMobileOpen(false)} className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white"><Plus size={17} aria-hidden="true" />Tạo chuyến đi</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-lg border border-border-main px-4 py-3 text-sm font-bold text-text-main hover:bg-background-warm"><LogIn size={17} aria-hidden="true" />Đăng nhập</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
