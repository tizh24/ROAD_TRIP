"use client";
import { toast } from "@/components/ui/sonner";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  getPartnerApplication,
  submitPartnerApplication,
  type PartnerApplication,
} from "@/features/partner/api/partner";

export default function PartnerRegisterPage() {
  const [application, setApplication] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string>();

  // Form fields
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("HOTEL");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const app = await getPartnerApplication();
      setApplication(app);
      if (app.status !== "NONE") {
        setBusinessName(app.businessName || "");
        setBusinessType(app.businessType || "HOTEL");
        setContactEmail(app.contactEmail || "");
        setContactPhone(app.contactPhone || "");
        setTaxId(app.taxId || "");
        setDescription(app.description || "");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vui lòng đăng nhập để kiểm tra trạng thái đối tác.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadStatus(), 0);
    return () => window.clearTimeout(timer);
  }, [loadStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !contactEmail.trim() || !contactPhone.trim()) return;

    try {
      setSubmitting(true);
      const res = await submitPartnerApplication({
        businessName: businessName.trim(),
        businessType,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        taxId: taxId.trim() || undefined,
        description: description.trim() || undefined,
      });
      setApplication(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể gửi hồ sơ đăng ký.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell max-w-3xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Đang tải">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="mt-8 h-96 rounded-xl" />
      </div>
    );
  }

  const canApply = !application || application.status === "NONE" || application.status === "REJECTED";
  const canSubmit = !submitting && businessName.trim() && contactEmail.trim() && contactPhone.trim();

  return (
    <div className="page-shell max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header>
        <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Đăng ký đối tác kinh doanh</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Hợp tác cùng Tripz để đưa dịch vụ lưu trú, nhà hàng, tour trải nghiệm và thuê xe đến du khách trên mỗi chặng hành trình.
        </p>
      </header>

      {application?.status === "APPROVED" && (
        <section className="mt-10 rounded-xl bg-muted p-6 sm:p-8" aria-labelledby="partner-approved">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
          <h2 id="partner-approved" className="mt-4 text-2xl font-medium tracking-tight">Tài khoản đối tác của bạn đã được kích hoạt!</h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Doanh nghiệp <strong className="font-medium text-foreground">{application.businessName}</strong> đã được phê duyệt chính thức. Bạn hiện có quyền truy cập đầy đủ vào trang quản lý dịch vụ và bảng số liệu.
          </p>
          <Button asChild className="mt-6 min-h-11">
            <Link href="/partner">Vào bảng điều khiển đối tác</Link>
          </Button>
        </section>
      )}

      {application?.status === "PENDING" && (
        <section className="mt-10 rounded-xl bg-muted p-6 sm:p-8" aria-labelledby="partner-pending">
          <p className="inline-flex items-center gap-2 text-sm">
            <Clock className="size-4" aria-hidden="true" /> Đang xét duyệt hồ sơ
          </p>
          <h2 id="partner-pending" className="mt-2 text-2xl font-medium tracking-tight">Hồ sơ đối tác: {application.businessName}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Đội ngũ kiểm duyệt Tripz đang xem xét thông tin doanh nghiệp của bạn. Thời gian xử lý trung bình từ 12-24 giờ làm việc.
          </p>
          <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Loại hình</dt>
              <dd className="mt-0.5 font-medium">{application.businessType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email liên hệ</dt>
              <dd className="mt-0.5 font-medium">{application.contactEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Số điện thoại</dt>
              <dd className="mt-0.5 font-medium">{application.contactPhone}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Thời điểm nộp</dt>
              <dd className="mt-0.5 font-medium">{application.createdAt ? new Date(application.createdAt).toLocaleString("vi-VN") : "Hôm nay"}</dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-muted-foreground">Chúng tôi sẽ gửi kết quả qua email và kích hoạt tài khoản tự động.</p>
        </section>
      )}

      {application?.status === "REJECTED" && (
        <div role="alert" className="mt-10 flex items-start gap-3 rounded-xl bg-muted p-5">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="text-base font-medium">Hồ sơ đối tác cần bổ sung thông tin</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Lý do từ ban quản trị: {application.reviewNotes || "Thông tin xác thực chưa đầy đủ. Vui lòng cập nhật lại và gửi lại hồ sơ."}
            </p>
            <p className="mt-2 text-sm">Bạn có thể chỉnh sửa thông tin bên dưới và gửi lại yêu cầu xét duyệt bất cứ lúc nào.</p>
          </div>
        </div>
      )}

      {canApply && (
        <section className="mt-10" aria-labelledby="partner-form-title">
          <h2 id="partner-form-title" className="text-xl font-medium">Thông tin đăng ký đối tác</h2>
          <p className="mt-1 text-sm text-muted-foreground">Vui lòng điền thông tin chính xác để đội ngũ hỗ trợ đối tác liên hệ và xác thực dịch vụ.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="pr-name" className="block text-sm font-medium">Tên doanh nghiệp / Cơ sở kinh doanh *</label>
              <Input id="pr-name" type="text" required placeholder="Ví dụ: Homestay Mộc Châu Xanh, Nhà hàng Sapa Deli..." value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-2 h-11" />
            </div>

            <div>
              <label htmlFor="pr-type" className="block text-sm font-medium">Loại hình dịch vụ kinh doanh *</label>
              <select id="pr-type" value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="field mt-2 min-h-11 w-full bg-card">
                <option value="HOTEL">Khách sạn / Resort nghỉ dưỡng</option>
                <option value="HOMESTAY">Homestay / Villa cho thuê</option>
                <option value="RESTAURANT">Nhà hàng / Quán ăn đặc sản</option>
                <option value="TOUR_OPERATOR">Công ty du lịch / Hướng dẫn tour trải nghiệm</option>
                <option value="TRANSPORT">Dịch vụ vận chuyển / Thuê xe phượt</option>
                <option value="OTHER">Dịch vụ du lịch khác</option>
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="pr-email" className="block text-sm font-medium">Email liên hệ đại diện *</label>
                <Input id="pr-email" type="email" required placeholder="partner@business.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-2 h-11" />
              </div>
              <div>
                <label htmlFor="pr-phone" className="block text-sm font-medium">Số điện thoại hotline *</label>
                <Input id="pr-phone" type="tel" required placeholder="0912 345 678" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-2 h-11" />
              </div>
            </div>

            <div>
              <label htmlFor="pr-tax" className="block text-sm font-medium">Mã số thuế / Giấy phép ĐKKD (tuỳ chọn)</label>
              <Input id="pr-tax" type="text" placeholder="0101234567" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="mt-2 h-11" />
            </div>

            <div>
              <label htmlFor="pr-desc" className="block text-sm font-medium">Mô tả tiện ích, địa chỉ và dịch vụ cung cấp</label>
              <Textarea id="pr-desc" rows={4} placeholder="Giới thiệu điểm nổi bật, vị trí cung đường, giá phòng trung bình..." value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2 min-h-28" />
            </div>

            <Button type="submit" size="lg" disabled={!canSubmit} className="min-h-12 w-full">
              <Send aria-hidden="true" />
              {submitting ? "Đang gửi hồ sơ..." : "Nộp hồ sơ đăng ký đối tác"}
            </Button>
          </form>
        </section>
      )}
    </div>
  );
}
