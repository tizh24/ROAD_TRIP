"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import {
  getAdminUsers,
  updateAdminUserRole,
  type AdminUser,
} from "@/features/partner/api/partner";

export default function AdminSettingsPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await getAdminUsers();
      setUsers([...data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách tài khoản.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: AdminUser["role"]) => {
    try {
      setUpdatingId(userId);
      await updateAdminUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
      setSuccessMessage(`Đã cập nhật vai trò cho người dùng thành ${newRole}.`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể cập nhật quyền người dùng.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto min-h-full max-w-[1400px] bg-background p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">
            Platform Capabilities · Admin Console
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-.03em] text-text-main">
            Quản trị Tài khoản & Phân quyền
          </h1>
          <p className="mt-1 text-sm text-text-sub">
            Quản lý vai trò người dùng (USER, PARTNER, MODERATOR, ADMIN) và lưu vết kiểm toán hệ thống.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white hover:bg-secondary/90 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {successMessage && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 flex items-center rounded-2xl border border-border-main bg-white px-4 py-2.5 shadow-sm max-w-md">
        <Search size={16} className="text-text-sub mr-2.5" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email người dùng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent text-xs text-text-main outline-none"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-text-sub">
          Đang tải danh sách tài khoản người dùng...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-main bg-white p-12 text-center text-text-sub">
          <Users className="mx-auto opacity-40" size={36} />
          <p className="mt-2 text-sm font-bold">Không tìm thấy người dùng phù hợp</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-main bg-white shadow-sm">
          <table className="w-full text-left text-xs text-text-main">
            <thead className="border-b border-border-main bg-gray-50/70 text-[11px] font-extrabold uppercase text-text-sub">
              <tr>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">Email liên kết</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5">Ngày tham gia</th>
                <th className="px-5 py-3.5">Vai trò nền tảng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-text-main text-sm">{user.fullName}</div>
                    <div className="text-[11px] font-mono text-text-sub truncate max-w-[200px]">
                      {user.id}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-text-sub">
                    <div className="flex items-center gap-1.5">
                      <Mail size={13} className="text-secondary" />
                      <span>{user.email}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        user.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-text-sub">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  <td className="px-5 py-4">
                    <select
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as AdminUser["role"])}
                      className="rounded-xl border border-border-main bg-white px-3 py-1.5 text-xs font-bold text-text-main outline-none focus:border-secondary transition cursor-pointer disabled:opacity-50"
                    >
                      <option value="USER">USER (Người dùng thường)</option>
                      <option value="PARTNER">PARTNER (Đối tác kinh doanh)</option>
                      <option value="MODERATOR">MODERATOR (Kiểm duyệt viên)</option>
                      <option value="ADMIN">ADMIN (Quản trị viên toàn quyền)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
