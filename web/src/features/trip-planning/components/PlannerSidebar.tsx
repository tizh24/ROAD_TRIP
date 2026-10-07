import React from "react";
import { Clock3, Route, Wallet } from "lucide-react";
import StopRow from "@/components/ui/StopRow";
import type { StopRowProps } from "@/components/ui/StopRow";

type Stop = StopRowProps["stop"];
type PlannerHandlers = {
  handleUpdate: (id: string, updates: Partial<Stop>) => void;
  handleRemove: (id: string) => void;
  handleMoveUp: (index: number) => void;
  handleMoveDown: (index: number) => void;
};

const formatVnd = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

export default function PlannerSidebar({ stops, handlers }: { stops: Stop[]; handlers: PlannerHandlers }) {
  const { handleUpdate, handleRemove, handleMoveUp, handleMoveDown } = handlers;
  const totalCost = stops.reduce((sum, stop) => sum + stop.cost, 0);
  const totalDuration = stops.reduce((sum, stop) => sum + stop.duration, 0);

  return (
    <aside className="z-20 flex w-full shrink-0 flex-col border-t border-border-main bg-surface lg:h-full lg:w-[27rem] lg:border-l lg:border-t-0 xl:w-[31rem]">
      <header className="border-b border-border-main px-4 py-5 sm:px-5 lg:px-6">
        <p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary">Ngày 01 · Hà Giang</p>
        <div className="mt-2 flex items-start justify-between gap-4"><div><h2 className="text-2xl font-extrabold tracking-[-.035em] text-text-main">Lộ trình trong ngày</h2><p className="mt-1 text-sm text-text-sub">Sắp xếp các điểm dừng theo nhịp di chuyển của bạn.</p></div><span className="shrink-0 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">{stops.length} điểm</span></div>
        <dl className="mt-5 grid grid-cols-3 divide-x divide-border-main rounded-panel border border-border-main bg-background-warm py-3">
          <div className="px-3"><dt className="flex items-center gap-1 text-[11px] font-bold text-text-sub"><Route size={13} /> Điểm dừng</dt><dd className="mt-1 text-lg font-extrabold text-text-main">{stops.length}</dd></div>
          <div className="px-3"><dt className="flex items-center gap-1 text-[11px] font-bold text-text-sub"><Clock3 size={13} /> Thời gian</dt><dd className="mt-1 text-lg font-extrabold text-text-main">{totalDuration}h</dd></div>
          <div className="px-3"><dt className="flex items-center gap-1 text-[11px] font-bold text-text-sub"><Wallet size={13} /> Dự toán</dt><dd className="mt-1 truncate text-sm font-extrabold text-text-main">{formatVnd(totalCost)}</dd></div>
        </dl>
      </header>
      <div className="bg-background p-3 sm:p-4 lg:flex-1 lg:overflow-y-auto lg:p-5"><div className="mb-3 flex items-center justify-between px-1"><h3 className="text-xs font-extrabold uppercase tracking-[.14em] text-text-sub">Các chặng đường</h3><p className="hidden text-xs text-text-sub sm:block">Dùng mũi tên để đổi thứ tự</p></div><div className="space-y-3">{stops.map((stop, index) => <StopRow key={stop.id} stop={stop} index={index} onRemove={() => handleRemove(stop.id)} onUpdate={(updates) => handleUpdate(stop.id, updates)} onMoveUp={() => handleMoveUp(index)} onMoveDown={() => handleMoveDown(index)} />)}</div></div>
    </aside>
  );
}
