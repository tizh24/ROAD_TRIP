"use client";
import React, { useState } from "react";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialState?: "collapsed" | "half" | "expanded";
}

export default function BottomSheet({ isOpen, onClose, children, initialState = "half" }: BottomSheetProps) {
  const [state, setState] = useState(initialState);

  if (!isOpen) return null;

  const widthClass = 
    state === "collapsed" ? "w-[300px]" :
    state === "half" ? "w-[500px]" : "w-[800px] max-w-full";

  return (
    <>
      <div className="fixed inset-0 bg-text-main/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full bg-surface shadow-card-hover z-50 flex flex-col transition-all duration-300 ease-in-out ${widthClass}`}>
        <div className="flex items-center justify-between p-4 border-b border-border-main bg-background/50">
          <div className="flex gap-2">
            <button 
              onClick={() => setState("collapsed")} 
              className={`px-3 py-1 rounded-chip text-caption font-semibold transition-colors ${state === "collapsed" ? "bg-primary text-white" : "bg-white border border-border-main text-text-sub hover:text-text-main"}`}
            >
              Thu gọn
            </button>
            <button 
              onClick={() => setState("half")} 
              className={`px-3 py-1 rounded-chip text-caption font-semibold transition-colors ${state === "half" ? "bg-primary text-white" : "bg-white border border-border-main text-text-sub hover:text-text-main"}`}
            >
              Tiêu chuẩn
            </button>
            <button 
              onClick={() => setState("expanded")} 
              className={`px-3 py-1 rounded-chip text-caption font-semibold transition-colors ${state === "expanded" ? "bg-primary text-white" : "bg-white border border-border-main text-text-sub hover:text-text-main"}`}
            >
              Mở rộng
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border-main text-text-main font-bold smooth-transition"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-surface">
          {children}
        </div>
      </div>
    </>
  );
}
