"use client";

import React from "react";
import Image from "next/image";
import { IconArrowDown, IconArrowUp, IconTrash } from "@/components/icons";

export interface StopRowProps {
  stop: { id: string; name: string; category?: string; cost: number; duration: number; imageUrl?: string };
  index: number;
  onRemove: () => void;
  onUpdate: (updates: Partial<StopRowProps["stop"]>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function StopRow({ stop, index, onRemove, onUpdate, onMoveUp, onMoveDown }: StopRowProps) {
  return <div className="flex items-start gap-3 rounded-card border border-border-main bg-surface p-3 shadow-card transition-all smooth-transition hover:-translate-y-px hover:shadow-card-hover sm:items-center">
    <div className="flex flex-col items-center gap-1 text-text-sub"><button type="button" aria-label={`Đưa ${stop.name} lên`} disabled={!onMoveUp || index === 0} onClick={onMoveUp} className="focus-ring rounded p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><IconArrowUp className="h-4 w-4" /></button><span className="flex h-6 w-6 items-center justify-center rounded-full bg-background text-caption font-bold text-text-main">{index + 1}</span><button type="button" aria-label={`Đưa ${stop.name} xuống`} disabled={!onMoveDown} onClick={onMoveDown} className="focus-ring rounded p-1 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"><IconArrowDown className="h-4 w-4" /></button></div>
    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-main bg-background">{stop.imageUrl ? <Image src={stop.imageUrl} alt={stop.name} width={64} height={64} unoptimized className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center bg-background text-caption text-text-sub">Không có ảnh</div>}</div>
    <div className="flex min-w-0 flex-1 flex-col gap-1.5"><div className="flex items-center gap-2"><h4 className="truncate text-body font-bold text-text-main">{stop.name}</h4>{stop.category && <span className="rounded-chip bg-accent/10 px-2 py-0.5 text-caption whitespace-nowrap text-accent">{stop.category}</span>}</div><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor={`${stop.id}-cost`}>Chi phí cho {stop.name}</label><input id={`${stop.id}-cost`} type="number" value={stop.cost} onChange={(event) => onUpdate({ cost: Number(event.target.value) })} className="focus-ring w-28 rounded-input border border-border-main bg-background px-2 py-1 text-caption" placeholder="Chi phí (đ)" /><label className="sr-only" htmlFor={`${stop.id}-duration`}>Thời lượng tại {stop.name}</label><input id={`${stop.id}-duration`} type="number" value={stop.duration} onChange={(event) => onUpdate({ duration: Number(event.target.value) })} className="focus-ring w-20 rounded-input border border-border-main bg-background px-2 py-1 text-caption" placeholder="Giờ" /></div></div>
    <button type="button" onClick={onRemove} aria-label={`Xóa ${stop.name}`} className="focus-ring shrink-0 rounded-btn p-2 text-text-sub transition-colors hover:bg-red-50 hover:text-red-500"><IconTrash className="h-5 w-5" /></button>
  </div>;
}
