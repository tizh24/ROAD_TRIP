"use client";
import React, { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "./sheet";
import { cn } from "@/lib/utils";

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialState?: "collapsed" | "half" | "expanded";
  title?: string;
}

const sizes = [
  { id: "collapsed", label: "Thu gọn", width: "sm:max-w-[300px]" },
  { id: "half", label: "Tiêu chuẩn", width: "sm:max-w-[500px]" },
  { id: "expanded", label: "Mở rộng", width: "sm:max-w-[800px]" },
] as const;

/** Side panel on the shadcn Sheet (focus trap, Escape, ARIA) with three width presets. */
export default function BottomSheet({
  isOpen,
  onClose,
  children,
  initialState = "half",
  title = "Chi tiết",
}: BottomSheetProps) {
  const [state, setState] = useState<(typeof sizes)[number]["id"]>(initialState);
  const current = sizes.find((size) => size.id === state) ?? sizes[1];

  return (
    <Sheet open={isOpen} onOpenChange={(next) => { if (!next) onClose(); }}>
      <SheetContent side="right" className={cn("w-full gap-0 p-0", current.width)}>
        <SheetHeader className="border-b border-border bg-background/50">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription className="sr-only">Bảng thông tin chi tiết</SheetDescription>
          <div className="flex gap-2 pr-8">
            {sizes.map((size) => (
              <button
                key={size.id}
                type="button"
                aria-pressed={state === size.id}
                onClick={() => setState(size.id)}
                className={cn(
                  "min-h-8 rounded-full px-3 text-xs font-semibold transition-colors",
                  state === size.id
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted-foreground hover:text-foreground",
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto bg-card p-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
