import type { ReactNode } from "react";

interface StatusPageProps {
  /** Short status code or label shown in muted type above the title, e.g. "404". */
  code?: string;
  title: string;
  description: string;
  children: ReactNode;
}

/** Full-screen state for 401, 403, 404 and errors: type and actions only, no decoration. */
export default function StatusPage({ code, title, description, children }: StatusPageProps) {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          {code ? <p className="text-sm text-muted-foreground tabular-nums">{code}</p> : null}
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
      </div>
    </main>
  );
}
