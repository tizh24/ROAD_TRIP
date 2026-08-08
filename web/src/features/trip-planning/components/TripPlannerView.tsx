"use client";
import React, { useState } from "react";
import MapPanel from "@/features/trip-planning/components/MapPanel";
import PlannerSidebar from "@/features/trip-planning/components/PlannerSidebar";

const INITIAL_STOPS = [
  { id: "s1", name: "Thành phố Hà Giang", category: "Khởi hành", cost: 0, duration: 0, imageUrl: "https://images.unsplash.com/photo-1626021200230-01d0c1598f1f?w=100&q=80" },
  { id: "s2", name: "Cổng trời Quản Bạ", category: "Tham quan", cost: 50000, duration: 2, imageUrl: "https://images.unsplash.com/photo-1596700543598-68e37cb0cc2c?w=100&q=80" },
  { id: "s3", name: "Rừng thông Yên Minh", category: "Lưu trú", cost: 350000, duration: 12, imageUrl: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=100&q=80" },
];

export default function TripPlannerView() {
  const [stops, setStops] = useState(INITIAL_STOPS);

  const handlers = {
    handleUpdate: (id: string, updates: any) => {
      setStops(stops.map(s => s.id === id ? { ...s, ...updates } : s));
    },
    handleRemove: (id: string) => {
      setStops(stops.filter(s => s.id !== id));
    },
    handleMoveUp: (index: number) => {
      if (index === 0) return;
      const newStops = [...stops];
      [newStops[index - 1], newStops[index]] = [newStops[index], newStops[index - 1]];
      setStops(newStops);
    },
    handleMoveDown: (index: number) => {
      if (index === stops.length - 1) return;
      const newStops = [...stops];
      [newStops[index], newStops[index + 1]] = [newStops[index + 1], newStops[index]];
      setStops(newStops);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-72px)] bg-gray-50 overflow-hidden relative">
      <MapPanel stops={stops} />
      <PlannerSidebar stops={stops} handlers={handlers} />
    </div>
  );
}
