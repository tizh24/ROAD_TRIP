"use client";
import React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const variantMap = {
  primary: { variant: "default", className: "font-bold shadow-xs hover:shadow-sm" },
  secondary: { variant: "outline", className: "border-border bg-white font-bold text-foreground shadow-sm hover:bg-muted" },
  danger: { variant: "default", className: "bg-destructive font-bold text-white hover:bg-[#962B21]" },
  ghost: { variant: "ghost", className: "font-bold text-foreground hover:bg-muted" },
} as const;

const sizeClass = {
  sm: "min-h-11 px-4 py-2 text-xs",
  md: "min-h-11 px-6 py-3 text-sm",
  lg: "min-h-12 px-8 py-4 text-base",
} as const;

/** Adapter kept for existing callers; rendering is delegated to the shadcn Button. */
export default function CTAButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CTAButtonProps) {
  const mapped = variantMap[variant];
  return (
    <Button
      variant={mapped.variant}
      className={cn("h-auto gap-2 rounded-lg", mapped.className, sizeClass[size], className)}
      {...props}
    >
      {children}
    </Button>
  );
}
