"use client";
import React, { useState, useRef, useEffect } from "react";

interface Suggestion {
  id: string;
  name: string;
  province: string;
  type: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (val: string) => void;
  className?: string;
}

const SAMPLE_SUGGESTIONS: Suggestion[] = [
  { id: "1", name: "Đèo Mã Pí Lèng", province: "Hà Giang", type: "Đèo hiểm trở" },
  { id: "2", name: "Cột cờ Lũng Cú", province: "Hà Giang", type: "Điểm cực Bắc" },
  { id: "3", name: "Hẻm Tu Sản", province: "Hà Giang", type: "Thắng cảnh" },
  { id: "4", name: "Thác Bản Giốc", province: "Cao Bằng", type: "Thác nước" },
  { id: "5", name: "Đèo Ô Quy Hồ", province: "Lào Cai", type: "Đèo hiểm trở" },
];

export default function SearchBar({ placeholder = "Tìm địa danh, cung đường phượt...", onSearch, className = "" }: SearchBarProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = SAMPLE_SUGGESTIONS.filter(item => 
    item.name.toLowerCase().includes(value.toLowerCase()) ||
    item.province.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative flex-1 max-w-md ${className}`}>
      {/* Search Input Container */}
      <div className={`relative flex h-11 items-center rounded-lg border bg-white px-3.5 smooth-transition ${
        isFocused ? "border-primary ring-2 ring-primary/15" : "border-border-main"
      }`}>
        <svg className="h-5 w-5 text-text-sub" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          className="h-full w-full border-none bg-transparent pl-3 text-sm font-sans text-text-main outline-none placeholder:text-text-sub"
        />
        {value && (
          <button 
            onClick={() => { setValue(""); if (onSearch) onSearch(""); }}
            className="text-text-sub smooth-transition hover:text-text-main"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestion Dropdown Panel */}
      {isFocused && (value.length > 0 || isFocused) && (
        <div className="absolute left-0 top-[48px] z-[100] w-full animate-slide-in overflow-hidden rounded-panel border border-border-main bg-white p-1.5 shadow-float">
          {filtered.length > 0 ? (
            <div>
              <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-text-sub">
                {value ? `Kết quả tìm kiếm (${filtered.length})` : "Địa điểm nổi bật"}
              </div>
              <ul className="space-y-0.5">
                {filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setValue(item.name);
                        setIsFocused(false);
                        if (onSearch) onSearch(item.name);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left smooth-transition hover:bg-background-warm"
                    >
                      <div>
                        <div className="text-xs font-bold text-text-main">{item.name}</div>
                        <div className="mt-0.5 text-[10px] text-text-sub">{item.province}</div>
                      </div>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {item.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="py-6 text-center text-xs font-bold text-text-sub">
              Không tìm thấy kết quả nào cho &quot;{value}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
