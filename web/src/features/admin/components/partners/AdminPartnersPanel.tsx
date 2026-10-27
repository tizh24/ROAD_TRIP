"use client";
import { toast } from "@/components/ui/sonner";

import React, { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { WorkspacePage } from "@/components/shell/WorkspacePage";
import {
  getAdminPartnerApplications,
  reviewAdminPartnerApplication,
  type PartnerApplication,
} from "@/features/partner/api/partner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
    const timer = window.setTimeout(() => void loadApplications(), 0);
    return () => window.clearTimeout(timer);
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
      toast.error(err instanceof Error ? err.message : "Không thể xử lý yêu cầu duyệt.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredApps = applications.filter((a) => {
    if (filterStatus === "ALL") return true;
    return a.status === filterStatus;
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;

  const tabs = [
    { key: "ALL", label: `Tất cả (${applications.length})` },
    { key: "PENDING", label: `Chờ duyệt (${pendingCount})` },
    { key: "APPROVED", label: "Đã duyệt (PARTNER)" },
    { key: "REJECTED", label: "Đã từ chối" },
  ];
  const statusLabel = (status: PartnerApplication["status"]) => (status === "APPROVED" ? "Đã duyệt" : status === "PENDING" ? "Chờ duyệt" : "Từ chối");

  return (
    <WorkspacePage
      title="Kiểm duyệt đối tác kinh doanh"
      description="Xác thực hồ sơ đăng ký của cơ sở lưu trú, nhà hàng, tour và cấp quyền nền tảng PARTNER."
      status={`Chờ duyệt: ${pendingCount}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button key={tab.key} type="button" size="sm" variant={filterStatus === tab.key ? "default" : "outline"} aria-pressed={filterStatus === tab.key} className="min-h-11" onClick={() => setFilterStatus(tab.key)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <Button type="button" variant="outline" className="min-h-11" onClick={loadApplications}>
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div className="mt-6 grid gap-1" aria-busy="true" aria-label="Đang tải hồ sơ đối tác">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-6 rounded-xl bg-muted p-6">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          <Button type="button" className="mt-4 min-h-11" onClick={loadApplications}>Thử lại</Button>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <h2 className="text-lg font-medium">Không có hồ sơ nào</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hiện không có đối tác nào phù hợp với bộ lọc này.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="px-4 pb-2 font-normal">Doanh nghiệp</th>
                <th scope="col" className="px-4 pb-2 font-normal">Loại hình</th>
                <th scope="col" className="px-4 pb-2 font-normal">Liên hệ</th>
                <th scope="col" className="px-4 pb-2 font-normal">Mã số thuế</th>
                <th scope="col" className="px-4 pb-2 font-normal">Trạng thái</th>
                <th scope="col" className="px-4 pb-2 text-right font-normal">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map((app, index) => (
                <tr key={app.id} className={index % 2 === 0 ? "bg-muted" : "bg-muted/50"}>
                  <td className="rounded-l-lg px-4 py-3 align-top">
                    <div className="font-medium">{app.businessName}</div>
                    <div className="text-xs text-muted-foreground">Chủ tài khoản: {app.applicantName || "Khách hàng"}</div>
                    {app.description && <p className="mt-1 line-clamp-1 max-w-xs text-xs text-muted-foreground">{app.description}</p>}
                  </td>
                  <td className="px-4 py-3 align-top">{app.businessType}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">
                    <div>{app.contactEmail}</div>
                    <div>{app.contactPhone}</div>
                  </td>
                  <td className="px-4 py-3 align-top font-mono text-muted-foreground">{app.taxId || "Chưa cung cấp"}</td>
                  <td className="px-4 py-3 align-top">
                    <span className={app.status === "APPROVED" ? "text-success" : app.status === "REJECTED" ? "text-destructive" : ""}>{statusLabel(app.status)}</span>
                  </td>
                  <td className="rounded-r-lg px-4 py-2 text-right align-top">
                    {app.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button type="button" size="sm" className="min-h-11" onClick={() => handleOpenReview(app, "APPROVE")}>
                          <Check aria-hidden="true" /> Duyệt
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="min-h-11 text-destructive hover:text-destructive" onClick={() => handleOpenReview(app, "REJECT")}>
                          <X aria-hidden="true" /> Từ chối
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Đã xử lý</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!reviewingApp} onOpenChange={(open) => { if (!open) setReviewingApp(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{reviewAction === "APPROVE" ? "Xác nhận phê duyệt đối tác" : "Từ chối hồ sơ đối tác"}</DialogTitle>
            <DialogDescription className="sr-only">Biểu mẫu trong hộp thoại</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReview} className="mt-2 space-y-4">
            <dl className="grid gap-1 text-sm">
              {[
                ["Doanh nghiệp", reviewingApp?.businessName],
                ["Loại hình", reviewingApp?.businessType],
                ["Email", reviewingApp?.contactEmail],
              ].map(([label, value], index) => (
                <div key={label} className={`flex justify-between gap-4 rounded-lg px-3 py-2 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            {reviewAction === "APPROVE" ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                <strong className="font-medium text-foreground">Lưu ý phân quyền:</strong> hành động này sẽ nâng cấp vai trò của người dùng thành <strong className="font-medium text-foreground">PARTNER</strong> và cấp quyền truy cập toàn diện vào cổng Partner Workspace.
              </p>
            ) : (
              <div>
                <label htmlFor="review-notes" className="block text-sm font-medium">Lý do từ chối (sẽ gửi tới người nộp hồ sơ) *</label>
                <Textarea id="review-notes" required rows={3} placeholder="Nêu rõ lý do từ chối hoặc yêu cầu bổ sung thông tin..." value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} className="mt-2 min-h-24" />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setReviewingApp(null)}>
                Hủy
              </Button>
              <Button type="submit" variant={reviewAction === "APPROVE" ? "default" : "destructive"} className="min-h-11" disabled={submittingReview}>
                {submittingReview ? "Đang xử lý..." : reviewAction === "APPROVE" ? "Phê duyệt & nâng cấp quyền" : "Xác nhận từ chối"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </WorkspacePage>
  );
}
