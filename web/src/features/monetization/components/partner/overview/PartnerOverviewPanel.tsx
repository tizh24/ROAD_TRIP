"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, TrendingUp, Users, MapPin, CheckCircle } from "lucide-react";
import CTAButton from "@/components/ui/CTAButton";

export default function PartnerOverviewPanel() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-fade-in-up">
      
      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] md:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Lượt hiển thị</p>
            <EyeIcon className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
          <p className="text-xl md:text-3xl font-bold text-gray-900 mb-1">45,210</p>
          <p className="text-[10px] md:text-xs text-green-600 font-medium">↑ 12% <span className="text-gray-400 hidden sm:inline">tháng này</span></p>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] md:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Lượt lấy Voucher</p>
            <TicketIcon className="text-gray-300 group-hover:text-amber-500 transition-colors" />
          </div>
          <p className="text-xl md:text-3xl font-bold text-gray-900 mb-1">1,204</p>
          <p className="text-[10px] md:text-xs text-green-600 font-medium">↑ 5% <span className="text-gray-400 hidden sm:inline">tuần này</span></p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-white p-4 md:p-6 rounded-2xl shadow-sm border border-orange-100 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] md:text-[11px] text-orange-800 uppercase tracking-wider font-semibold">Khách sắp tới</p>
            <MapPin className="text-orange-300 group-hover:text-secondary transition-colors" size={18} />
          </div>
          <p className="text-xl md:text-3xl font-bold text-secondary mb-1">342</p>
          <p className="text-[10px] md:text-xs text-orange-600 font-medium">Dự báo 7 ngày tới</p>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] md:text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Check-in thực tế</p>
            <CheckCircle className="text-gray-300 group-hover:text-green-500 transition-colors" size={18} />
          </div>
          <p className="text-xl md:text-3xl font-bold text-gray-900 mb-1">89</p>
          <p className="text-[10px] md:text-xs text-gray-500 font-medium">Đạt 8% Conversion Rate</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* CAMPAIGN WIDGET */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 bg-gray-50/50">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Chiến dịch đang chạy</h2>
            <button onClick={() => router.push("/partner/campaigns")} className="text-[11px] md:text-xs text-secondary font-medium hover:underline flex items-center gap-1">
              Xem tất cả <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] md:text-[11px] uppercase font-semibold text-gray-400 bg-gray-50/50">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4">Tên Chiến Dịch</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Trạng thái</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Chi phí</th>
                  <th className="px-4 md:px-6 py-3 md:py-4">Lượt Click</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-800">Đẩy Top Lộ Trình Hà Giang</td>
                  <td className="px-4 md:px-6 py-3 md:py-4"><span className="px-2.5 py-1 bg-green-50 text-green-700 text-[11px] font-medium rounded-md border border-green-100/50">Đang chạy</span></td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500 text-xs md:text-sm">450.000 đ</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-900 font-bold">3,402</td>
                </tr>
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-800">Voucher Giảm 10% Tháng 10</td>
                  <td className="px-4 md:px-6 py-3 md:py-4"><span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[11px] font-medium rounded-md border border-gray-200/50">Đã Tạm Dừng</span></td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500 text-xs md:text-sm">120.000 đ</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-gray-900 font-bold">1,120</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* DEMOGRAPHICS WIDGET */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Chân dung Khách hàng</h2>
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md font-semibold">Tháng này</span>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-700">Đến từ TP.HCM</span>
                <span className="text-secondary">65%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-700">Đến từ Hà Nội</span>
                <span className="text-blue-500">25%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-gray-700">Nhóm 2-4 người</span>
                <span className="text-primary">70%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
          </div>
          
          <CTAButton variant="ghost" className="w-full mt-6 text-secondary border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl text-sm" onClick={() => router.push("/partner/analytics")}>
            Xem báo cáo Data Insights
          </CTAButton>
        </div>
      </div>
    </div>
  );
}

// Simple icons for cards
function EyeIcon(props: any) {
  return <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
}
function TicketIcon(props: any) {
  return <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
}
