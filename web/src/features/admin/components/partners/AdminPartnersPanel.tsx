"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  Phone,
  ShieldCheck,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import {
  getAdminPartnerApplications,
  reviewAdminPartnerApplication,
  type PartnerApplication,
} from "@/features/partner/api/partner";

export default function AdminPartnersPanel() {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // Review modal
  const [reviewingApp, setReviewingApp] = useState<PartnerApplication | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [reviewNotes, setReviewNotes] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await getAdminPartnerApplications();
      setApplications([...data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách hồ sơ đối tác.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleOpenReview = (app: PartnerApplication, action: "APPROVE" | "REJECT") => {
    setReviewingApp(app);
    setReviewAction(action);
    setReviewNotes(action === "APPROVE" ? "Đã xác thực giấy phép và thông tin doanh nghiệp hợp lệ." : "");
  };

  const handleConfirmReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingApp?.id) return;
    try {
      setSubmittingReview(true);
      await reviewAdminPartnerApplication(reviewingApp.id, reviewAction, reviewNotes.trim() || undefined);
      setApplications((prev) =>
        prev.map((a) =>
          a.id === reviewingApp.id
            ? { ...a, status: reviewAction === "APPROVE" ? "APPROVED" : "REJECTED", reviewNotes }
            : a,
        ),
      );
      setReviewingApp(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Không thể xử lý yêu cầu duyệt.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (filterStatus === "ALL") return true;
    return a.status === filterStatus;
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="mx-auto min-h-full max-w-[1400px] bg-background p-4 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[.16em] text-secondary">
            Operations & Verification
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-[-.03em] text-text-main">
            Kiểm duyệt Đối tác Kinh doanh
          </h1>
          <p className="mt-1 text-sm text-text-sub">
            Xác thực hồ sơ đăng ký của cơ sở lưu trú, nhà hàng, tour và cấp quyền nền tảng PARTNER.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-border-main bg-white px-4 py-2 text-xs font-bold shadow-xs">
            Chờ duyệt: <span className="text-amber-600 font-extrabold">{pendingCount}</span>
          </div>
          <button
            onClick={loadApplications}
            className="rounded-xl bg-secondary px-4 py-2 text-xs font-bold text-white hover:bg-secondary/90 transition"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex border-b border-border-main text-xs font-bold">
        {[
          { key: "ALL", label: `Tất cả (${applications.length})` },
          { key: "PENDING", label: `Chờ duyệt (${pendingCount})` },
          { key: "APPROVED", label: "Đã duyệt (PARTNER)" },
          { key: "REJECTED", label: "Đã từ chối" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`border-b-2 px-4 py-3 transition ${
              filterStatus === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-text-sub hover:text-text-main"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Table */}
      {loading ? (
        <div className="py-20 text-center text-sm text-text-sub">
          Đang tải hồ sơ đối tác...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-main bg-white p-16 text-center text-text-sub">
          <ShieldCheck className="mx-auto text-secondary opacity-40" size={40} />
          <h3 className="mt-3 text-base font-bold text-text-main">Không có hồ sơ nào</h3>
          <p className="mt-1 text-xs text-text-sub">
            Hiện không có đối tác nào phù hợp với bộ lọc này.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-main bg-white shadow-sm">
          <table className="w-full text-left text-xs text-text-main">
            <thead className="border-b border-border-main bg-gray-50/70 text-[11px] font-extrabold uppercase text-text-sub">
              <tr>
                <th className="px-5 py-3.5">Doanh nghiệp</th>
                <th className="px-5 py-3.5">Loại hình</th>
                <th className="px-5 py-3.5">Liên hệ</th>
                <th className="px-5 py-3.5">Mã số thuế</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4">
                    <div className="font-bold text-text-main text-sm">{app.businessName}</div>
                    <div className="mt-0.5 text-text-sub text-[11px]">
                      Chủ tài khoản: {app.applicantName || "Khách hàng"}
                    </div>
                    {app.description && (
                      <p className="mt-1 text-text-sub line-clamp-1 italic max-w-xs">{app.description}</p>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-md bg-secondary/10 px-2.5 py-1 font-bold text-secondary">
                      {app.businessType}
                    </span>
                  </td>

                  <td className="px-5 py-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-text-sub">
                      <Mail size={12} className="text-primary" />
                      <span>{app.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-sub">
                      <Phone size={12} className="text-primary" />
                      <span>{app.contactPhone}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 font-mono text-text-sub">
                    {app.taxId || "Chưa cung cấp"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-bold ${
                        app.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "PENDING"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {app.status === "APPROVED" && <CheckCircle2 size={12} />}
                      {app.status === "PENDING" && <Clock size={12} />}
                      {app.status === "REJECTED" && <XCircle size={12} />}
                      <span>
                        {app.status === "APPROVED"
                          ? "Đã duyệt"
                          : app.status === "PENDING"
                            ? "Chờ duyệt"
                            : "Từ chối"}
                      </span>
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    {app.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenReview(app, "APPROVE")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 font-bold text-white hover:bg-emerald-700 transition"
                        >
                          <Check size={13} /> Duyệt
                        </button>
                        <button
                          onClick={() => handleOpenReview(app, "REJECT")}
                          className="inline-flex items-center gap-1 rounded-lg border border-border-main px-3 py-1.5 font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          <X size={13} /> Từ chối
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-sub italic">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h3 className="text-base font-bold text-text-main">
                {reviewAction === "APPROVE" ? "Xác nhận Phê duyệt Đối tác" : "Từ chối Hồ sơ Đối tác"}
              </h3>
              <button
                onClick={() => setReviewingApp(null)}
                className="rounded-lg p-1.5 text-text-sub hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmReview} className="mt-4 space-y-4">
              <div className="rounded-xl bg-background-warm p-4 text-xs space-y-1">
                <div>
                  <span className="text-text-sub">Doanh nghiệp:</span>{" "}
                  <strong>{reviewingApp.businessName}</strong>
                </div>
                <div>
                  <span className="text-text-sub">Loại hình:</span>{" "}
                  <strong>{reviewingApp.businessType}</strong>
                </div>
                <div>
                  <span className="text-text-sub">Email:</span>{" "}
                  <strong>{reviewingApp.contactEmail}</strong>
                </div>
              </div>

              {reviewAction === "APPROVE" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                  <p className="font-semibold">Lưu ý phân quyền:</p>
                  <p className="mt-0.5">
                    Hành động này sẽ nâng cấp vai trò của người dùng thành <strong>PARTNER</strong> và cấp quyền truy cập toàn diện vào cổng Partner Workspace.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-text-main">
                    Lý do từ chối (sẽ gửi tới người nộp hồ sơ) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Nêu rõ lý do từ chối hoặc yêu cầu bổ sung thông tin..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingApp(null)}
                  className="rounded-xl border border-border-main px-4 py-2 text-xs font-semibold text-text-sub hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className={`rounded-xl px-4 py-2 text-xs font-bold text-white transition ${
                    reviewAction === "APPROVE"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {submittingReview
                    ? "Đang xử lý..."
                    : reviewAction === "APPROVE"
                      ? "Phê duyệt & Nâng cấp quyền"
                      : "Xác nhận Từ chối"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
