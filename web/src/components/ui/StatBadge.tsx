"use client";
import React from "react";

export type StatVariant = "duration" | "distance" | "cost" | "clone";

interface StatBadgeProps {
  variant: StatVariant;
  value: string | number;
  className?: string;
}

export default function StatBadge({ variant, value, className = "" }: StatBadgeProps) {
  // Render corresponding SVG based on variant
  const getIcon = () => {
    switch (variant) {
      case "duration":
        return (
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "distance":
        return (
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case "cost":
        return (
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "clone":
        return (
          <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        );
    }
  };

  // Border radius: Chips 4px, color schemas based on secondary green/slate secondary
  const styles = {
    duration: "bg-blue-50 text-blue-700",
    distance: "bg-teal-50 text-teal-700",
    cost: "bg-amber-50 text-amber-700",
    clone: "bg-orange-50 text-orange-700",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-[4px] text-xs font-bold ${styles[variant]} ${className}`}>
      {getIcon()}
      {value}
    </span>
  );
}

