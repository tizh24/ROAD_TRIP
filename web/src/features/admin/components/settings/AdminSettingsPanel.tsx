"use client";
import { toast } from "@/components/ui/sonner";

import React, { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspacePage } from "@/components/shell/WorkspacePage";
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
      toast.error(err instanceof Error ? err.message : "Không thể cập nhật quyền người dùng.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <WorkspacePage
      title="Quản trị tài khoản & phân quyền"
      description="Quản lý vai trò người dùng (USER, PARTNER, MODERATOR, ADMIN) và lưu vết kiểm toán hệ thống."
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="text"
            aria-label="Tìm theo tên hoặc email người dùng"
            placeholder="Tìm theo tên hoặc email người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9"
          />
        </div>
        <Button type="button" variant="outline" className="min-h-11" onClick={loadUsers}>
          <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />
          Làm mới
        </Button>
      </div>

      {successMessage && (
        <p role="status" className="mt-4 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {successMessage}
        </p>
      )}

      {loading ? (
        <div className="mt-6 grid gap-1" aria-busy="true" aria-label="Đang tải danh sách tài khoản">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-muted p-6">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          <Button type="button" className="mt-4 min-h-11" onClick={loadUsers}>Thử lại</Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <p className="text-base font-medium">Không tìm thấy người dùng phù hợp</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[44rem] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="px-4 pb-2 font-normal">Người dùng</th>
                <th scope="col" className="px-4 pb-2 font-normal">Email liên kết</th>
                <th scope="col" className="px-4 pb-2 font-normal">Trạng thái</th>
                <th scope="col" className="px-4 pb-2 font-normal">Ngày tham gia</th>
                <th scope="col" className="px-4 pb-2 font-normal">Vai trò nền tảng</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-muted" : "bg-muted/50"}>
                  <td className="rounded-l-lg px-4 py-3">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="max-w-[200px] truncate font-mono text-xs text-muted-foreground">{user.id}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={user.status === "ACTIVE" ? "text-success" : "text-destructive"}>
                      {user.status === "ACTIVE" ? "Hoạt động" : "Bị khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td className="rounded-r-lg px-4 py-2">
                    <select
                      aria-label={`Vai trò của ${user.fullName}`}
                      value={user.role}
                      disabled={updatingId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as AdminUser["role"])}
                      className="field min-h-11 bg-card"
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
    </WorkspacePage>
  );
}
