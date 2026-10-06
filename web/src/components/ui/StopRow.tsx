"use client";
import React from "react";
import Image from "next/image";
import { IconTrash, IconArrowUp, IconArrowDown } from "@/components/icons";

export interface StopRowProps {
  stop: {
    id: string;
    name: string;
    category?: string;
    cost: number;
    duration: number; // in hours
    imageUrl?: string;
  };
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<StopRowProps["stop"]>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function StopRow({ stop, index, onRemove, onUpdate, onMoveUp, onMoveDown }: StopRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-border-main bg-surface p-3 shadow-sm transition-all smooth-transition hover:shadow-card-default sm:items-center">
      {/* Drag handle / Order index */}
      <div className="flex flex-col items-center gap-1 text-text-sub">
        <button type="button" aria-label={`Đưa ${stop.name} lên`} disabled={!onMoveUp || index === 0} onClick={onMoveUp} className="focus-ring rounded p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><IconArrowUp className="w-4 h-4" /></button>
        <span className="w-6 h-6 flex items-center justify-center bg-background font-bold rounded-full text-caption text-text-main">
          {index + 1}
        </span>
        <button type="button" aria-label={`Đưa ${stop.name} xuống`} disabled={!onMoveDown} onClick={onMoveDown} className="focus-ring rounded p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><IconArrowDown className="w-4 h-4" /></button>
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0 border border-border-main">
        {stop.imageUrl ? (
          <Image src={stop.imageUrl} alt={stop.name} width={64} height={64} unoptimized className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-sub text-caption bg-slate-100">No img</div>
        )}
      </div>

      {/* Info & Inputs */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-body font-bold text-text-main truncate">{stop.name}</h4>
          {stop.category && (
            <span className="px-2 py-0.5 rounded-chip bg-accent/20 text-yellow-700 text-caption whitespace-nowrap">
              {stop.category}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`${stop.id}-cost`}>Chi phí cho {stop.name}</label>
          <input
            id={`${stop.id}-cost`}
            type="number"
            value={stop.cost}
            onChange={(e) => onUpdate({ cost: Number(e.target.value) })}
            className="focus-ring w-28 rounded-input border border-border-main bg-background px-2 py-1 text-caption"
            placeholder="Chi phí (đ)"
          />
          <label className="sr-only" htmlFor={`${stop.id}-duration`}>Thời lượng tại {stop.name}</label>
          <input
            id={`${stop.id}-duration`}
            type="number"
            value={stop.duration}
            onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
            className="focus-ring w-20 rounded-input border border-border-main bg-background px-2 py-1 text-caption"
            placeholder="Giờ"
          />
        </div>
      </div>

      {/* Delete Action */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Xóa ${stop.name}`}
        className="focus-ring shrink-0 rounded-btn p-2 text-text-sub transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <IconTrash className="w-5 h-5" />
      </button>
    </div>
  );
}

