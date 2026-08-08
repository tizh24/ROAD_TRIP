"use client";
import React from "react";
import CTAButton from "./CTAButton";
import SearchBar from "./SearchBar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Tent, Users, User, Plus } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname() || "";

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: <Tent size={16} /> },
    { href: "/explore", label: "Khám phá", icon: <Map size={16} /> },
    { href: "/feed", label: "Cộng đồng", icon: <Users size={16} /> },
  ];

  return (
    <header className="sticky top-0 z-[1000] w-full h-[72px] bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm font-sans">
      <div className="max-w-[1440px] px-6 h-full mx-auto flex items-center justify-between gap-6">
        
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
        <nav className="hidden lg:flex items-center gap-2">
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
          <Link href="/planner/new">
            <CTAButton 
              variant="primary" 
              size="sm" 
              className="hidden sm:flex items-center gap-2 py-2.5 shadow-md shadow-primary/20"
            >
              <Plus size={16} /> Tạo Lộ Trình
            </CTAButton>
          </Link>
          
          <Link 
            href="/profile" 
            className={`w-10 h-10 rounded-full border-2 overflow-hidden transition-colors shrink-0 ${pathname === '/profile' ? 'border-primary' : 'border-gray-200 hover:border-gray-400'}`}
            title="Trang cá nhân"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
              alt="User profile photo" 
              className="w-full h-full object-cover" 
            />
          </Link>
        </div>

      </div>
    </header>
  );
}
