"use client";
import React, { useState } from "react";
import CTAButton from "./CTAButton";
import SearchBar from "./SearchBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Tent, Users, Plus, Menu, X, LogIn } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname() || "";
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: <Tent size={16} /> },
    { href: "/explore", label: "Khám phá", icon: <Map size={16} /> },
    { href: "/feed", label: "Cộng đồng", icon: <Users size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full bg-background/90 backdrop-blur-xl border-b border-border-light shadow-sm font-sans">
      <div className="page-shell min-h-[72px] mx-auto flex items-center justify-between gap-3">
        
        {/* Left Side: Brand Logo */}
        <Link href="/" className="flex items-center gap-3 cursor-pointer shrink-0 group">
          <div className="bg-primary text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 font-black text-lg group-hover:scale-105 transition-transform">
            <Map size={20} className="fill-white/20" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-gray-900 leading-none uppercase">Road Trip</h1>
            <span className="text-[10px] font-bold text-primary tracking-widest mt-1 block uppercase">Planner</span>
          </div>
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
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
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
              className="hidden sm:flex items-center gap-2 py-2.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> Tạo Lộ Trình
            </CTAButton>
          </Link>
          
          <Link href="/login" className="focus-ring hidden shrink-0 items-center gap-2 rounded-xl border border-border-main bg-surface px-3 py-2 text-sm font-bold text-text-main hover:bg-background-warm sm:inline-flex" title="Đăng nhập">
            <LogIn size={16} aria-hidden="true" /> Đăng nhập
          </Link>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-xl text-text-main hover:bg-background-warm lg:hidden"
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
                <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${isActive ? "bg-secondary/10 text-secondary" : "text-text-main hover:bg-background-warm"}`}>
                  {link.icon}
                  {link.label}
                </Link>
              );
            })}
            <Link href="/trips/new" onClick={() => setMobileOpen(false)} className="focus-ring mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"><Plus size={17} aria-hidden="true" />Tạo chuyến đi</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="focus-ring mt-1 flex items-center justify-center gap-2 rounded-xl border border-border-main px-4 py-3 text-sm font-bold text-text-main hover:bg-background-warm"><LogIn size={17} aria-hidden="true" />Đăng nhập</Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
