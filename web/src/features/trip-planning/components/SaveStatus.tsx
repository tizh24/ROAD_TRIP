"use client";

export type SaveState = "saved" | "saving" | "failed" | "conflict";

export default function SaveStatus({ state, onRetry, onReload }: { state: SaveState; onRetry?: () => void; onReload?: () => void }) {
  if (state === "saved") return <p role="status" className="inline-flex rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-bold text-secondary">Đã lưu</p>;
  if (state === "saving") return <p role="status" className="inline-flex rounded-full bg-background-warm px-3 py-1.5 text-sm font-bold text-text-sub">Đang lưu…</p>;
  if (state === "conflict") return <div role="alert" className="rounded-xl bg-accent/15 p-3 text-sm text-text-main">Lịch trình đã được thay đổi ở nơi khác. <button type="button" onClick={onReload} className="focus-ring ml-1 rounded font-bold underline">Tải lại</button></div>;
  return <div role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">Lưu thất bại. <button type="button" onClick={onRetry} className="focus-ring ml-1 rounded font-bold underline">Thử lại</button></div>;
}
