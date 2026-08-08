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
      <div className={`relative flex items-center bg-white border smooth-transition h-11 px-3.5 rounded-[8px] ${
        isFocused ? "border-[#FF6B35] ring-2 ring-[#FF6B35]/15" : "border-[#E5E0DB]"
      }`}>
        <svg className="w-5 h-5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="w-full h-full bg-transparent border-none outline-none pl-3 text-sm text-[#1A1A2E] placeholder-[#6B7280] font-sans"
        />
        {value && (
          <button 
            onClick={() => { setValue(""); if (onSearch) onSearch(""); }}
            className="text-[#6B7280] hover:text-[#1A1A2E] smooth-transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestion Dropdown Panel */}
      {isFocused && (value.length > 0 || isFocused) && (
        <div className="absolute top-[48px] left-0 w-full bg-white border border-[#E5E0DB] shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[20px] overflow-hidden z-[100] p-1.5 animate-slide-in">
          {filtered.length > 0 ? (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#6B7280] px-3.5 py-2">
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
                      className="w-full text-left px-3.5 py-2.5 hover:bg-[#F8F4F0] rounded-[16px] smooth-transition flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#1A1A2E]">{item.name}</div>
                        <div className="text-[10px] text-[#6B7280] mt-0.5">{item.province}</div>
                      </div>
                      <span className="text-[10px] font-bold text-[#2D6A4F] bg-[#2D6A4F]/10 px-2 py-0.5 rounded-[4px]">
                        {item.type}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-[#6B7280] font-bold">
              Không tìm thấy kết quả nào cho "{value}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
