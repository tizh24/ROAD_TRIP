"use client";
import React, { useState, useEffect } from "react";
import CTAButton from "@/components/ui/CTAButton";
import { Inbox, CheckCircle, XCircle, FileText, ImageIcon, Search, Filter, Users, Loader2 } from "lucide-react";

export default function ModerationPanel() {
  const [selectedTicket, setSelectedTicket] = useState<number | null>(1);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network fetch
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const mockTickets = [
    { id: 1, type: "New Place", title: "Bãi Cắm Trại Tà Xùa", user: "@phuotthu99", status: "pending", time: "2h ago", description: "Tọa độ cắm trại mới tinh tại đỉnh Tà Xùa, đường đi hơi khó nhưng view mây cực đẹp." },
    { id: 2, type: "Report", title: "Review Ảo - Quán Cơm Tấm", user: "System", status: "pending", time: "5h ago", description: "Hệ thống phát hiện 50 review 5 sao liên tục từ cùng một dải IP cho quán Cơm Tấm Đêm." },
    { id: 3, type: "B2B Profile", title: "Hải Motobike Rental", user: "System", status: "pending", time: "1d ago", description: "Cập nhật giấy phép kinh doanh mới." }
  ];

  if (isLoading) {
    return (
      <div className="h-full flex flex-col lg:flex-row gap-6 p-4 lg:p-8 bg-[#FAFAFA] animate-pulse">
        {/* Skeleton Left Pane */}
        <div className="w-full lg:w-[340px] bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm shrink-0 h-[400px] lg:h-auto">
          <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-5 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-full bg-gray-100 rounded"></div>
                <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
        {/* Skeleton Right Pane */}
        <div className="hidden lg:flex flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col p-8">
           <div className="h-8 w-1/2 bg-gray-100 rounded mb-4"></div>
           <div className="h-4 w-1/4 bg-gray-100 rounded mb-8"></div>
           <div className="h-32 w-full bg-gray-50 rounded mb-8"></div>
           <div className="flex gap-4">
             <div className="h-28 w-40 bg-gray-50 rounded"></div>
             <div className="h-28 w-40 bg-gray-50 rounded"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-8 animate-fade-in-up bg-[#FAFAFA]">
      
      {/* Left Pane: Ticket List */}
      <div className={`w-full lg:w-[340px] bg-white rounded-2xl border border-gray-100 flex flex-col shadow-sm shrink-0 overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-2">
            <Inbox size={18} className="text-gray-400" />
            <h3 className="font-semibold text-gray-800 text-sm">Pending Queue</h3>
          </div>
          <span className="text-xs font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">3</span>
        </div>
        
        <div className="px-5 py-3 border-b border-gray-50 flex gap-2">
           <div className="flex-1 relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search tickets..." className="w-full text-xs pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none focus:border-primary/30 transition-colors" />
           </div>
           <button className="p-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-500 hover:text-gray-800 transition-colors">
             <Filter size={14} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {mockTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <CheckCircle size={32} className="mb-2 text-green-400 opacity-50" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs">No pending items in queue.</p>
            </div>
          ) : (
            mockTickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 group border ${
                  selectedTicket === ticket.id
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
                    ticket.type === 'Report' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {ticket.type}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-600 transition-colors">{ticket.time}</span>
                </div>
                <h4 className={`font-semibold text-sm truncate transition-colors ${selectedTicket === ticket.id ? 'text-primary' : 'text-gray-800'}`}>
                  {ticket.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-1 truncate font-medium">by {ticket.user}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Ticket Details */}
      <div className={`flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex-col overflow-hidden relative ${!selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        {selectedTicket ? (
          <>
            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-b border-gray-50 bg-gray-50/50">
              <button onClick={() => setSelectedTicket(null)} className="text-sm font-medium text-gray-600 flex items-center gap-1 hover:text-primary">
                ← Back to Queue
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-6 lg:mb-8">
                <div>
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                    {mockTickets.find(t => t.id === selectedTicket)?.title}
                  </h2>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs"><Users size={12}/></span>
                    Reported by <span className="text-gray-800 font-semibold">{mockTickets.find(t => t.id === selectedTicket)?.user}</span>
                  </p>
                </div>
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm self-start">
                  #{selectedTicket.toString().padStart(4, '0')}
                </span>
              </div>
              
              <div className="mb-6 lg:mb-8 bg-gray-50/50 rounded-xl p-4 lg:p-6 border border-gray-100">
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  <FileText size={14} /> Description
                </h4>
                <div className="text-sm text-gray-700 leading-relaxed font-medium">
                  {mockTickets.find(t => t.id === selectedTicket)?.description}
                </div>
              </div>

              {/* Mock Image Area */}
              <div>
                <h4 className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                  <ImageIcon size={14} /> Evidence / Attachments
                </h4>
                <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                  {[1, 2].map(img => (
                    <div key={img} className="w-40 lg:w-48 h-28 lg:h-32 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer group shrink-0">
                      <ImageIcon size={20} className="mb-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs font-medium">View Image {img}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="p-4 lg:p-5 border-t border-gray-50 bg-white flex flex-col lg:flex-row gap-3 lg:gap-4 justify-end items-center shadow-[0_-10px_20px_rgba(0,0,0,0.01)]">
              <span className="text-xs text-gray-400 font-medium lg:mr-auto lg:pl-2 text-center lg:text-left w-full lg:w-auto">Review carefully before taking action.</span>
              <div className="flex gap-3 w-full lg:w-auto">
                <CTAButton 
                  variant="ghost" 
                  className="flex-1 lg:flex-none justify-center items-center gap-2 text-red-600 bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 font-medium rounded-xl px-6 py-2.5 transition-all"
                >
                  <XCircle size={18} /> Reject
                </CTAButton>
                <CTAButton 
                  variant="primary" 
                  className="flex-1 lg:flex-none justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl px-6 py-2.5 shadow-sm hover:shadow transition-all"
                  onClick={() => {
                    setProcessingId(selectedTicket);
                    setTimeout(() => setProcessingId(null), 1000);
                  }}
                  disabled={processingId === selectedTicket}
                >
                  {processingId === selectedTicket ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CheckCircle size={18} /> Approve</>
                  )}
                </CTAButton>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Inbox size={40} className="opacity-40" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready for Review</h3>
            <p className="text-sm text-gray-500 max-w-[250px]">Select an item from the queue on the left to inspect details and take action.</p>
          </div>
        )}
      </div>
    </div>
  );
}
