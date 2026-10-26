"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
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

/** Destructive confirmation built on the shadcn AlertDialog (focus trap, Escape, ARIA). */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Hủy",
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => { if (!next && !busy) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <CTAButton disabled={busy} variant="secondary" onClick={onClose}>{cancelLabel}</CTAButton>
          <CTAButton disabled={busy} variant="danger" onClick={onConfirm}>
            {busy ? "Đang xử lý…" : confirmLabel}
          </CTAButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
