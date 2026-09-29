import React from "react";
import { Settings } from "lucide-react";

export default function ProfileSettingsPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-6 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Cài đặt Tài khoản</h1>
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6">
            <Settings size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Đang phát triển</h2>
          <p className="text-sm text-gray-500">Tính năng thay đổi mật khẩu và cập nhật thông tin cá nhân sẽ sớm ra mắt.</p>
        </div>
      </div>
    </div>
  );
}
