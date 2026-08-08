"use client";
import React from "react";

export type ExpenseCategory = "food" | "fuel" | "sleep" | "activity" | "other";

interface ExpenseChipProps {
  category: ExpenseCategory;
  className?: string;
}

export default function ExpenseChip({ category, className = "" }: ExpenseChipProps) {
  const config = {
    food: {
      label: "Ăn uống",
      emoji: "🍔",
      style: "bg-orange-50 text-orange-700 border-orange-200/50",
    },
    fuel: {
      label: "Di chuyển",
      emoji: "⛽",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    },
    sleep: {
      label: "Lưu trú",
      emoji: "🏨",
      style: "bg-amber-50 text-amber-700 border-amber-200/50",
    },
    activity: {
      label: "Vui chơi",
      emoji: "🎟️",
      style: "bg-purple-50 text-purple-700 border-purple-200/50",
    },
    other: {
      label: "Chi phí khác",
      emoji: "🪙",
      style: "bg-slate-50 text-slate-700 border-slate-200/50",
    },
  };

  const { label, emoji, style } = config[category] || config.other;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold border ${style} ${className}`}>
      <span className="mr-1">{emoji}</span>
      {label}
    </span>
  );
}

