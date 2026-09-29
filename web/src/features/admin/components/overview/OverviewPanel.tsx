"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Download, Inbox, Eye } from "lucide-react";

export default function OverviewPanel() {
  const router = useRouter();

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-fade-in-up">
      {/* Action-Oriented Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">System Health & Metrics</h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">Monitor the overall ecosystem performance.</p>
        </div>
        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
          <select className="flex-1 md:flex-none text-xs md:text-sm border border-gray-200 rounded-xl px-3 md:px-4 py-2 bg-white text-gray-700 cursor-pointer outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm">
            <option>This Month</option>
            <option>Last 7 Days</option>
            <option>Today</option>
          </select>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 text-xs md:text-sm font-medium bg-white border border-gray-200 px-4 md:px-5 py-2 rounded-xl hover:bg-gray-50 hover:text-gray-900 text-gray-700 transition-all shadow-sm hover:shadow active:scale-95">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Users", value: "24,592", change: "+12%", color: "text-blue-600", action: () => router.push('/admin/users') },
          { label: "Active Trips", value: "3,104", change: "+5%", color: "text-green-600", action: () => {} },
          { label: "Pending Reviews", value: "142", change: "-2%", color: "text-amber-600", action: () => router.push('/admin/moderation') },
          { label: "MRR (Revenue)", value: "$12,450", change: "+18%", color: "text-primary", action: () => router.push('/admin/finance') },
        ].map((stat, i) => (
          <button 
            key={i} 
            onClick={stat.action}
            className="text-left bg-white p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex justify-between items-start mb-2">
              <p className="text-[10px] md:text-[11px] text-gray-500 uppercase tracking-wider font-semibold truncate pr-2">{stat.label}</p>
              <ArrowUpRight size={16} className="text-gray-300 group-hover:text-primary transition-colors shrink-0" />
            </div>
            <p className={`text-xl md:text-3xl font-bold ${stat.color} mb-1 tracking-tight`}>{stat.value}</p>
            <p className="text-[10px] md:text-xs text-gray-600"><span className="font-medium">{stat.change}</span> <span className="text-gray-400 hidden sm:inline">vs last month</span></p>
          </button>
        ))}
      </div>

      {/* Moderation Queue Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 bg-gray-50/50">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-amber-50 rounded-lg text-amber-500"><Inbox size={16} className="md:w-[18px] md:h-[18px]" /></div>
            <h2 className="text-sm md:text-base font-semibold text-gray-900">Recent Moderation Activity</h2>
          </div>
          <button className="text-[11px] md:text-xs text-primary font-medium hover:underline flex items-center gap-1" onClick={() => router.push('/admin/moderation')}>
            <span className="hidden sm:inline">View Full Queue</span>
            <span className="sm:hidden">View All</span> 
            <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] md:text-[11px] uppercase font-semibold text-gray-400 bg-gray-50/50">
              <tr>
                <th className="px-4 md:px-6 py-3 md:py-4">Type</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Content</th>
                <th className="px-4 md:px-6 py-3 md:py-4">Reported By</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 md:px-6 py-3 md:py-4"><span className="px-2 md:px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] md:text-[11px] font-medium rounded-md border border-amber-100/50">New Place</span></td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-800 font-medium group-hover:text-primary transition-colors text-xs md:text-sm">Bãi Cắm Trại Tà Xùa</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-gray-500 text-[11px] md:text-xs">@phuotthu99</td>
                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                  <button 
                    className="inline-flex items-center gap-1.5 text-[11px] md:text-xs font-medium text-gray-500 hover:text-primary bg-white hover:bg-primary/5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-200 hover:border-primary/20 transition-all shadow-sm" 
                    onClick={() => router.push('/admin/moderation?id=1')}
                  >
                    <Eye size={14} /> Review
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
