"use client";
import { toast } from "@/components/ui/sonner";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
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
      <div className="flex min-h-[70vh] items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            <Briefcase size={15} />
            <span>TRIPZ PARTNER NETWORK</span>
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Cổng Đăng Ký Đối Tác Kinh Doanh
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl mx-auto">
            Hợp tác cùng Tripz để đưa dịch vụ lưu trú, nhà hàng, tour trải nghiệm và thuê xe đến hàng ngàn du khách trên mỗi chặng hành trình.
          </p>
        </div>

        {/* Existing Application Status Cards */}
        {application?.status === "APPROVED" && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-card p-8 text-center shadow-sm">
            <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
            <h2 className="mt-4 text-2xl font-bold text-foreground">
              Tài khoản Đối tác của bạn đã được kích hoạt!
            </h2>
            <p className="mt-2 text-sm text-muted-foreground max-w-lg mx-auto">
              Doanh nghiệp <strong>{application.businessName}</strong> đã được phê duyệt chính thức. Bạn hiện có quyền truy cập đầy đủ vào trang quản lý dịch vụ và bảng số liệu.
            </p>
            <div className="mt-6">
              <Link
                href="/partner"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition"
              >
                Vào Bảng điều khiển Đối tác
              </Link>
            </div>
          </div>
        )}

        {application?.status === "PENDING" && (
          <div className="mt-8 rounded-3xl border border-amber-200 bg-card p-8 shadow-sm">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
              <div className="rounded-2xl bg-amber-100 p-4 text-amber-700">
                <Clock size={36} />
              </div>
              <div className="flex-1">
                <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                  Đang xét duyệt hồ sơ
                </span>
                <h2 className="mt-2 text-xl font-bold text-foreground">
                  Hồ sơ đối tác: {application.businessName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Đội ngũ kiểm duyệt Tripz đang xem xét thông tin doanh nghiệp của bạn. Thời gian xử lý trung bình từ 12-24 giờ làm việc.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted p-4 rounded-xl border border-border">
                  <div>
                    <span className="text-muted-foreground">Loại hình:</span>{" "}
                    <strong className="text-foreground">{application.businessType}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email liên hệ:</span>{" "}
                    <strong className="text-foreground">{application.contactEmail}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số điện thoại:</span>{" "}
                    <strong className="text-foreground">{application.contactPhone}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Thời điểm nộp:</span>{" "}
                    <strong className="text-foreground">
                      {application.createdAt ? new Date(application.createdAt).toLocaleString("vi-VN") : "Hôm nay"}
                    </strong>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Chúng tôi sẽ gửi kết quả qua email và kích hoạt tài khoản tự động.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {application?.status === "REJECTED" && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-800">
            <div className="flex items-start gap-4">
              <AlertCircle size={28} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-base">Hồ sơ đối tác cần bổ sung thông tin</h3>
                <p className="mt-1 text-xs text-red-700 leading-relaxed">
                  Lý do từ ban quản trị: {application.reviewNotes || "Thông tin xác thực chưa đầy đủ. Vui lòng cập nhật lại và gửi lại hồ sơ."}
                </p>
                <p className="mt-2 text-xs font-semibold text-red-900">
                  Bạn có thể chỉnh sửa thông tin bên dưới và gửi lại yêu cầu xét duyệt bất cứ lúc nào.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Application Form (shown if not applied, or if rejected) */}
        {(!application || application.status === "NONE" || application.status === "REJECTED") && (
          <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10">
            <h2 className="text-xl font-bold text-foreground">Thông tin đăng ký đối tác</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Vui lòng điền thông tin chính xác để đội ngũ hỗ trợ đối tác liên hệ và xác thực dịch vụ.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-foreground">
                  Tên doanh nghiệp / Cơ sở kinh doanh *
                </label>
                <div className="mt-1 flex items-center rounded-xl border border-border px-3 py-2 focus-within:border-primary">
                  <Building2 size={16} className="text-muted-foreground mr-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Homestay Mộc Châu Xanh, Nhà hàng Sapa Deli..."
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-transparent text-sm text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">
                  Loại hình dịch vụ kinh doanh *
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-primary"
                >
                  <option value="HOTEL">Khách sạn / Resort nghỉ dưỡng</option>
                  <option value="HOMESTAY">Homestay / Villa cho thuê</option>
                  <option value="RESTAURANT">Nhà hàng / Quán ăn đặc sản</option>
                  <option value="TOUR_OPERATOR">Công ty du lịch / Hướng dẫn tour trải nghiệm</option>
                  <option value="TRANSPORT">Dịch vụ vận chuyển / Thuê xe phượt</option>
                  <option value="OTHER">Dịch vụ du lịch khác</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground">Email liên hệ đại diện *</label>
                  <div className="mt-1 flex items-center rounded-xl border border-border px-3 py-2 focus-within:border-primary">
                    <Mail size={16} className="text-muted-foreground mr-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="partner@business.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-transparent text-sm text-foreground outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground">Số điện thoại hotline *</label>
                  <div className="mt-1 flex items-center rounded-xl border border-border px-3 py-2 focus-within:border-primary">
                    <Phone size={16} className="text-muted-foreground mr-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full bg-transparent text-sm text-foreground outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">
                  Mã số thuế / Giấy phép ĐKKD (tuỳ chọn)
                </label>
                <input
                  type="text"
                  placeholder="0101234567"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground">
                  Mô tả tiện ích, địa chỉ và dịch vụ cung cấp
                </label>
                <textarea
                  rows={4}
                  placeholder="Giới thiệu điểm nổi bật, vị trí cung đường, giá phòng trung bình..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || !businessName.trim() || !contactEmail.trim() || !contactPhone.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  <Send size={16} />
                  {submitting ? "Đang gửi hồ sơ..." : "Nộp hồ sơ đăng ký đối tác"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
