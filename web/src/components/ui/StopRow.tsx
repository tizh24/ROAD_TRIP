"use client";
import React from "react";
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
    <div className="flex items-center gap-3 p-3 bg-surface border border-border-main rounded-card shadow-sm hover:shadow-card-default transition-all smooth-transition group">
      {/* Drag handle / Order index */}
      <div className="flex flex-col items-center gap-1 text-text-sub">
        <button type="button" onClick={onMoveUp} className="hover:text-primary"><IconArrowUp className="w-4 h-4" /></button>
        <span className="w-6 h-6 flex items-center justify-center bg-background font-bold rounded-full text-caption text-text-main">
          {index + 1}
        </span>
        <button type="button" onClick={onMoveDown} className="hover:text-primary"><IconArrowDown className="w-4 h-4" /></button>
      </div>

      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-background overflow-hidden shrink-0 border border-border-main">
        {stop.imageUrl ? (
          <img src={stop.imageUrl} alt={stop.name} className="w-full h-full object-cover" />
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
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={stop.cost}
            onChange={(e) => onUpdate({ cost: Number(e.target.value) })}
            className="w-24 px-2 py-1 rounded-input border border-border-main text-caption focus:outline-none focus:border-primary bg-background"
            placeholder="Cost (VND)"
          />
          <input
            type="number"
            value={stop.duration}
            onChange={(e) => onUpdate({ duration: Number(e.target.value) })}
            className="w-20 px-2 py-1 rounded-input border border-border-main text-caption focus:outline-none focus:border-primary bg-background"
            placeholder="Giờ"
          />
        </div>
      </div>

      {/* Delete Action */}
      <button
        type="button"
        onClick={onRemove}
        className="p-2 text-text-sub hover:text-red-500 hover:bg-red-50 rounded-btn transition-colors shrink-0"
      >
        <IconTrash className="w-5 h-5" />
      </button>
    </div>
  );
}

