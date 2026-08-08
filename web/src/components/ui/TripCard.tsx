"use client";
import React from "react";
import ExpenseChip from "./ExpenseChip";

export interface TripData {
  id: string;
  title: string;
  image: string;
  province: string;
  clones: number;
  author: { name: string; avatar: string };
  duration: string;
  distance: string;
  cost: string;
}

interface TripCardProps {
  trip: TripData;
}

import Link from "next/link";

export default function TripCard({ trip }: TripCardProps) {
  return (
    <Link href={`/trip/${trip.id}`} className="group bg-surface rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-border-main/60 smooth-transition cursor-pointer flex flex-col h-full transform hover:-translate-y-1 block">
      {/* Cover Image */}
      <div className="relative w-full h-56 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={trip.image} 
          alt={trip.title} 
          className="w-full h-full object-cover group-hover:scale-105 smooth-transition duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-text-main/80 via-transparent to-transparent opacity-80" />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <span className="bg-white/90 backdrop-blur-md text-text-main text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            {trip.province}
          </span>
          <div className="bg-text-main/60 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <span className="text-primary">🔥</span> {trip.clones.toLocaleString()} Clones
          </div>
        </div>
        
        {/* Author */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={trip.author.avatar} alt={trip.author.name} className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md" />
          <span className="text-white text-xs font-bold drop-shadow-md">{trip.author.name}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex flex-col flex-1 bg-surface">
        <h3 className="text-xl font-black text-text-main mb-4 line-clamp-2 leading-snug group-hover:text-primary smooth-transition">
          {trip.title}
        </h3>
        
        <div className="mt-auto space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-border-main/50">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-sub uppercase font-bold tracking-widest mb-1">Thời gian</span>
              <span className="text-sm font-black text-text-main">{trip.duration}</span>
            </div>
            <div className="w-px h-8 bg-border-main/50" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-sub uppercase font-bold tracking-widest mb-1">Độ dài</span>
              <span className="text-sm font-black text-text-main">{trip.distance}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-1">
            <div className="flex flex-col">
              <span className="text-[10px] text-text-sub uppercase font-bold tracking-widest mb-1">Dự toán</span>
              <span className="text-lg font-black text-primary">{trip.cost}</span>
            </div>
            <button className="w-10 h-10 rounded-full bg-background-warm text-text-main flex items-center justify-center group-hover:bg-primary group-hover:text-white smooth-transition">
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
