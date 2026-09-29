"use client";
import React from "react";

interface Member {
  name: string;
  avatar?: string;
  color?: string;
}

interface AvatarClusterProps {
  members: Member[];
  className?: string;
  size?: "sm" | "md";
}

export default function AvatarCluster({ members, className = "", size = "md" }: AvatarClusterProps) {
  const maxAvatars = 4;
  const visibleMembers = members.slice(0, maxAvatars);
  const overflowCount = members.length - maxAvatars;

  const sizeClasses = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs";
  const offsetClasses = size === "sm" ? "-ml-1.5" : "-ml-2.5";

  return (
    <div className={`flex items-center ${className}`}>
      {visibleMembers.map((member, index) => {
        // Fallback user initial
        const initial = member.name.charAt(0).toUpperCase();
        const bgColor = member.color || "#FF6B35";

        return (
          <div
            key={index}
            className={`relative rounded-full border-2 border-white flex items-center justify-center font-bold text-white overflow-hidden shadow-sm smooth-transition hover:-translate-y-1 hover:z-10 ${sizeClasses} ${index > 0 ? offsetClasses : ""}`}
            style={{ 
              backgroundColor: bgColor, 
              zIndex: visibleMembers.length - index 
            }}
            title={member.name}
          >
            {member.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={member.avatar}
                alt={member.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
        );
      })}

      {overflowCount > 0 && (
        <div
          className={`relative rounded-full border-2 border-white bg-[#E5E0DB] text-[#1A1A2E] flex items-center justify-center font-black shadow-sm ${sizeClasses} ${offsetClasses}`}
          style={{ zIndex: 0 }}
        >
          +{overflowCount}
        </div>
      )}
    </div>
  );
}

