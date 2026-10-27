"use client";

import { AlertCircle, Inbox, LockKeyhole, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import CTAButton from "./CTAButton";

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
const iconStyles = {
  empty: "bg-accent/20 text-warning",
  error: "bg-destructive/10 text-destructive",
  permission: "bg-muted text-foreground",
};

export default function FeedbackState({ kind, title, description, actionLabel, onAction, children }: FeedbackStateProps) {
  const Icon = icons[kind];
  return (
    <section className="surface-card flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center" role={kind === "error" ? "alert" : undefined}>
      <span className={"flex h-12 w-12 items-center justify-center rounded-2xl " + iconStyles[kind]} aria-hidden="true"><Icon size={24} /></span>
      <h2 className="mt-5 text-h3 text-foreground">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
      {actionLabel && onAction ? (
        <CTAButton className="mt-6" variant={kind === "error" ? "secondary" : "primary"} onClick={onAction}>
          {kind === "error" ? <RefreshCw size={16} aria-hidden="true" /> : null}
          {actionLabel}
        </CTAButton>
      ) : null}
    </section>
  );
}
