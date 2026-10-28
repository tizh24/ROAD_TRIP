"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

interface AuthStageProps {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}

/** Full-screen stage shared by every authentication page: rotating color wash, grid, centered card slot. */
export default function AuthStage({ children, backHref = "/", backLabel = "Về trang chủ" }: AuthStageProps) {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      {/* Full-bleed rotating multi-color wash, sized past the container so it reads as motion */}
      <motion.div
        className="pointer-events-none absolute -inset-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "conic-gradient(from 0deg, var(--chart-1), var(--chart-4), var(--chart-2), var(--chart-5), var(--chart-1))",
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        aria-hidden="true"
      />

      {/* Grid layered on top of the color wash */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      <Link
        href={backHref}
        className="absolute left-6 top-6 z-10 inline-flex min-h-11 items-center gap-2 rounded-md bg-card/80 px-3 text-sm font-medium text-foreground backdrop-blur hover:bg-card"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {backLabel}
      </Link>

      {children}
    </main>
  );
}
