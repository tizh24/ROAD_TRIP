"use client";

export type SaveState = "saved" | "saving" | "failed" | "conflict";

export default function SaveStatus({ state, onRetry, onReload }: { state: SaveState; onRetry?: () => void; onReload?: () => void }) {
  if (state === "saved") return <p role="status" className="text-sm font-medium text-secondary">Đã lưu</p>;
  if (state === "saving") return <p role="status" className="text-sm font-medium text-gray-600">Đang lưu…</p>;
  if (state === "conflict") return <div role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Lịch trình đã được thay đổi ở nơi khác. <button onClick={onReload} className="font-bold underline">Tải lại</button></div>;
  return <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">Lưu thất bại. <button onClick={onRetry} className="font-bold underline">Thử lại</button></div>;
}
