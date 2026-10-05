"use client";

import { useEffect } from "react";
import CTAButton from "./CTAButton";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function ConfirmDialog({ open, title, description, confirmLabel, cancelLabel = "Hủy", busy = false, onConfirm, onClose }: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape" && !busy) onClose(); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [busy, onClose, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end bg-text-main/45 p-4 backdrop-blur-sm sm:items-center sm:justify-center" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
      <section aria-describedby="confirm-dialog-description" aria-labelledby="confirm-dialog-title" aria-modal="true" className="surface-card w-full max-w-md p-6 sm:p-7" role="dialog">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-danger">Xác nhận hành động</p>
        <h2 id="confirm-dialog-title" className="mt-2 text-h3 text-text-main">{title}</h2>
        <p id="confirm-dialog-description" className="mt-3 text-sm leading-6 text-text-sub">{description}</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <CTAButton disabled={busy} variant="secondary" onClick={onClose}>{cancelLabel}</CTAButton>
          <CTAButton disabled={busy} variant="danger" onClick={onConfirm}>{busy ? "Đang xử lý…" : confirmLabel}</CTAButton>
        </div>
      </section>
    </div>
  );
}
