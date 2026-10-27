"use client";

export type SaveState = "saved" | "saving" | "failed" | "conflict";

export default function SaveStatus({ state, onRetry, onReload }: { state: SaveState; onRetry?: () => void; onReload?: () => void }) {
  if (state === "saved") return <p role="status" className="inline-flex text-sm text-muted-foreground">Đã lưu</p>;
  if (state === "saving") return <p role="status" className="inline-flex text-sm text-muted-foreground">Đang lưu…</p>;
  if (state === "conflict") return <div role="alert" className="rounded-lg bg-muted p-3 text-sm text-foreground">Lịch trình đã được thay đổi ở nơi khác. <button type="button" onClick={onReload} className="focus-ring ml-1 rounded font-medium underline">Tải lại</button></div>;
  return <div role="alert" className="rounded-lg bg-muted p-3 text-sm text-destructive">Lưu thất bại. <button type="button" onClick={onRetry} className="focus-ring ml-1 rounded font-medium underline">Thử lại</button></div>;
}
