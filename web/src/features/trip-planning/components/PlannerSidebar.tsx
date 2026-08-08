import React from "react";
import StopRow from "@/components/ui/StopRow";
import CTAButton from "@/components/ui/CTAButton";
import { Wallet, Clock, Plus, Wand2 } from "lucide-react";

export default function PlannerSidebar({ stops, handlers }: { stops: any[], handlers: any }) {
  const { handleUpdate, handleRemove, handleMoveUp, handleMoveDown } = handlers;
  
  const totalCost = stops.reduce((sum, s) => sum + s.cost, 0);
  const totalDuration = stops.reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="w-full lg:w-[450px] xl:w-[500px] flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-gray-100 shrink-0 h-[60vh] lg:h-full relative z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      
      {/* Header & Budget Card */}
      <div className="p-5 lg:p-6 border-b border-gray-50 bg-white z-10 shrink-0">
        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight mb-1">Kế hoạch chuyến đi</h2>
        <p className="text-xs text-gray-500 mb-6">Thêm, xóa hoặc sắp xếp lại các điểm dừng.</p>
        
        {/* Budget Glass Card */}
        <div className="flex flex-col p-5 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          {/* Subtle gradient accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          
          <div className="flex gap-4 mb-5 relative z-10">
            <div className="flex-1">
              <span className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet size={12} /> Tổng Dự Toán
              </span>
              <span className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">{totalCost.toLocaleString()} đ</span>
              <span className="text-[10px] font-semibold text-green-600 block mt-1">Tiết kiệm 15%</span>
            </div>
            <div className="w-px bg-gray-200" />
            <div className="flex-1 pl-2">
              <span className="text-[10px] text-gray-500 font-bold block mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={12} /> Thời gian
              </span>
              <span className="text-xl lg:text-2xl font-black text-gray-900 tracking-tight">{totalDuration}h</span>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="flex gap-1.5 mb-5 relative z-10">
            <div className="h-1.5 rounded-full bg-blue-500" style={{ width: '40%' }} title="Lưu trú" />
            <div className="h-1.5 rounded-full bg-green-500" style={{ width: '30%' }} title="Ăn uống" />
            <div className="h-1.5 rounded-full bg-amber-500" style={{ width: '30%' }} title="Di chuyển" />
          </div>
          
          <div className="pt-4 border-t border-gray-200/50 relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Ngân sách mục tiêu</span>
              <span className="text-[10px] font-bold text-gray-700">2.0M</span>
            </div>
            <input type="range" min="100000" max="2000000" className="w-full h-1 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary" />
          </div>
        </div>
      </div>

      {/* Stops List */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#FAFAFA] space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Lịch trình di chuyển</span>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2.5 py-1 rounded-md">
            <Wand2 size={12} /> Tự động tối ưu
          </button>
        </div>

        <div className="space-y-3">
          {stops.map((stop, idx) => (
            <StopRow 
              key={stop.id} 
              stop={stop} 
              index={idx} 
              onRemove={() => handleRemove(stop.id)}
              onUpdate={(u: any) => handleUpdate(stop.id, u)}
              onMoveUp={() => handleMoveUp(idx)}
              onMoveDown={() => handleMoveDown(idx)}
            />
          ))}
        </div>

        <CTAButton variant="ghost" className="w-full border-2 border-dashed border-gray-200 py-3 text-gray-500 hover:text-primary hover:border-primary/30 hover:bg-white font-semibold mt-4 rounded-xl flex items-center justify-center gap-2 transition-all">
          <Plus size={16} /> Thêm điểm dừng mới
        </CTAButton>
      </div>
      
      {/* Footer Actions */}
      <div className="p-4 lg:p-6 border-t border-gray-50 bg-white z-10 shrink-0">
        <CTAButton variant="primary" className="w-full shadow-sm hover:shadow-md py-3 rounded-xl font-bold">
          Lưu lộ trình & Mời bạn bè
        </CTAButton>
      </div>
    </div>
  );
}
