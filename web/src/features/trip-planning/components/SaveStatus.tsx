"use client";

export type SaveState = "saved" | "saving" | "failed" | "conflict";

export default function SaveStatus({ state, onRetry, onReload }: { state: SaveState; onRetry?: () => void; onReload?: () => void }) {
  if (state === "saved") return <p role="status" className="inline-flex rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-foreground">Đã lưu</p>;
  if (state === "saving") return <p role="status" className="inline-flex rounded-full bg-muted px-3 py-1.5 text-sm font-bold text-muted-foreground">Đang lưu…</p>;
  if (state === "conflict") return <div role="alert" className="rounded-xl bg-accent/15 p-3 text-sm text-foreground">Lịch trình đã được thay đổi ở nơi khác. <button type="button" onClick={onReload} className="focus-ring ml-1 rounded font-bold underline">Tải lại</button></div>;
  return <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">Lưu thất bại. <button type="button" onClick={onRetry} className="focus-ring ml-1 rounded font-bold underline">Thử lại</button></div>;
}
