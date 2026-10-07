"use client";
import React from "react";

export interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export default function CTAButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CTAButtonProps) {
  const baseStyles = "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg font-bold smooth-transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";
  
  const variants = {
    primary: "bg-primary text-white shadow-card hover:bg-primary-hover hover:shadow-card-hover",
    secondary: "border border-border-main bg-white text-text-main shadow-sm hover:border-secondary/40 hover:shadow-card",
    danger: "bg-danger text-white shadow-card hover:bg-[#962B21] hover:shadow-card-hover",
    ghost: "bg-transparent text-text-main hover:bg-background-warm",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
