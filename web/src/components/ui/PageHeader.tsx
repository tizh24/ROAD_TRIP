import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions, children }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-5 border-b border-border-light pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.16em] text-secondary">{eyebrow}</p> : null}
        <h1 className="text-h1 text-text-main">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-text-sub">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </header>
  );
}
