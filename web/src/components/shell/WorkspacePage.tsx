import type { ReactNode } from "react";

/** Page frame for partner and admin workspaces: one h1, a short lead, then the content. */
export function WorkspacePage({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description: string;
  status?: string;
  children: ReactNode;
}) {
  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {status && <p className="w-fit text-sm text-muted-foreground">{status}</p>}
      </header>
      <div className="mt-10">{children}</div>
    </div>
  );
}

/** Honest empty state: says what is missing and when it will appear. No sample data. */
export function EmptyWorkspace({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <section className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{text}</p>
      {children}
    </section>
  );
}
