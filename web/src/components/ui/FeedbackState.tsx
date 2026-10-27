"use client";

import { AlertCircle, Inbox, LockKeyhole, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

type FeedbackKind = "empty" | "error" | "permission";
type FeedbackStateProps = {
  kind: FeedbackKind;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

const icons = { empty: Inbox, error: AlertCircle, permission: LockKeyhole };

/** Empty, error and permission states keep their frame: a flat bordered block, icon without a tinted tile. */
export default function FeedbackState({ kind, title, description, actionLabel, onAction, children }: FeedbackStateProps) {
  const Icon = icons[kind];
  return (
    <section
      className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-10 text-center"
      role={kind === "error" ? "alert" : undefined}
    >
      <Icon size={22} className={kind === "error" ? "text-destructive" : "text-muted-foreground"} aria-hidden="true" />
      <h2 className="mt-4 text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      {actionLabel && onAction ? (
        <Button className="mt-6 min-h-11" variant={kind === "error" ? "outline" : "default"} onClick={onAction}>
          {kind === "error" ? <RefreshCw aria-hidden="true" /> : null}
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
