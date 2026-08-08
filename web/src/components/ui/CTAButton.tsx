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
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-full smooth-transition active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-primary/20";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-[0_8px_20px_rgba(255,90,38,0.25)] hover:shadow-[0_12px_24px_rgba(255,90,38,0.35)]",
    secondary: "bg-white text-text-main border border-border-main hover:border-text-sub shadow-sm hover:shadow-md",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_12px_24px_rgba(239,68,68,0.4)]",
    ghost: "bg-transparent text-text-main hover:bg-border-main/50",
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
