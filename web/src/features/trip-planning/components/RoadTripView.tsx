"use client";
import { toast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  MapPin,
  Navigation,
  PhoneCall,
  ShieldAlert,
  Smartphone,
} from "lucide-react";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import {
  getTrip,
  updateTripLocation,
  updateTripStatus,
} from "@/features/trip-planning/api/trips";
import type { TripDetail } from "@/features/trip-planning/api/trip-model";
import FeedbackState from "@/components/ui/FeedbackState";
import { trackAnalytics } from "@/lib/analytics/analytics";

type State =
  | { kind: "loading" }
  | { kind: "ready"; trip: TripDetail }
  | { kind: "missing" }
  | { kind: "forbidden" }
  | { kind: "error"; message: string };

export default function RoadTripView({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [dayIndex, setDayIndex] = useState(0);
  const [checkIns, setCheckIns] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [completingTrip, setCompletingTrip] = useState(false);
  const [confirmingComplete, setConfirmingComplete] = useState(false);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  // Load check-in records from localStorage on client
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(`roadtrip_checkins_${tripId}`);
        if (stored) {
          setCheckIns(JSON.parse(stored) as Record<string, boolean>);
        }
      } catch {
        // localStorage unavailable or restricted
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [tripId]);

  const toggleCheckIn = (stopId: string) => {
    setCheckIns((prev) => {
      const next = { ...prev, [stopId]: !prev[stopId] };
      try {
        localStorage.setItem(`roadtrip_checkins_${tripId}`, JSON.stringify(next));
      } catch {
        // quota exceeded or storage blocked
      }
      return next;
    });
  };

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const trip = await getTrip(tripId);
      setState({ kind: "ready", trip });
    } catch (error) {
      if (error instanceof GatewayApiError && error.code === "TRIP_NOT_FOUND") {
        setState({ kind: "missing" });
      } else if (error instanceof GatewayApiError && error.code === "FORBIDDEN") {
        setState({ kind: "forbidden" });
      } else {
        setState({
          kind: "error",
          message: error instanceof Error ? error.message : "Không thể tải thông tin chuyến đi.",
        });
      }
    }
  }, [tripId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (state.kind === "ready") {
      trackAnalytics(
        "road_trip_viewed",
        { role: state.trip.role, permission: state.trip.permission },
        { dedupeKey: state.trip.id },
      );
    }
  }, [state]);

  const copyMobileLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // clipboard access fallback
    }
  };

  const handleCompleteTrip = () => setConfirmingComplete(true);

  const confirmCompleteTrip = async () => {
    setConfirmingComplete(false);
    setCompletingTrip(true);
    try {
      await updateTripStatus(tripId, "COMPLETED");
      router.push(`/memory/${tripId}`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Không thể hoàn tất chuyến đi.");
      setCompletingTrip(false);
    }
  };

  const handleToggleLocationSharing = async () => {
    if (!isSharingLocation) {
      if (!navigator.geolocation) {
        toast.error("Thiết bị không hỗ trợ định vị GPS.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            await updateTripLocation(tripId, {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              sharingActive: true,
              consentGiven: true,
            });
            setIsSharingLocation(true);
          } catch (cause) {
            toast.error(cause instanceof Error ? cause.message : "Không thể chia sẻ vị trí.");
          }
        },
        (err) => {
          toast.error(`Không thể lấy tọa độ GPS: ${err.message}`);
        },
        { enableHighAccuracy: true },
      );
    } else {
      try {
        await updateTripLocation(tripId, {
          latitude: 0,
          longitude: 0,
          sharingActive: false,
          consentGiven: false,
        });
        setIsSharingLocation(false);
      } catch (cause) {
        toast.error(cause instanceof Error ? cause.message : "Không thể tắt chia sẻ vị trí.");
      }
    }
  };

  if (state.kind === "loading") {
    return (
      <div className="page-shell w-full py-12" aria-busy="true">
        <div className="h-10 w-72 animate-pulse rounded bg-border" />
        <div className="surface-card mt-8 h-80 animate-pulse" />
      </div>
    );
  }

  if (state.kind === "missing" || state.kind === "forbidden") {
    return (
      <div className="page-shell py-16">
        <FeedbackState
          kind={state.kind === "missing" ? "empty" : "permission"}
          title={state.kind === "missing" ? "Không tìm thấy chuyến đi" : "Bạn không có quyền truy cập"}
          description={
            state.kind === "missing"
              ? "Chuyến đi có thể đã bị xóa hoặc không còn tồn tại."
              : "Bạn cần là thành viên của chuyến đi để truy cập chế độ đi đường."
          }
        >
          <Link href="/dashboard" className="focus-ring text-sm font-bold text-primary hover:underline">
            Về danh sách chuyến đi
          </Link>
        </FeedbackState>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="page-shell py-16">
        <FeedbackState
          kind="error"
          title="Không thể tải chuyến đi"
          description={state.message}
          actionLabel="Thử lại"
          onAction={() => void load()}
        />
      </div>
    );
  }

  const { trip } = state;
  const activeDay = trip.days[dayIndex] ?? trip.days[0];
  const activeStops = activeDay ? activeDay.stops : [];
  const completedStopsInDay = activeStops.filter((stop) => checkIns[stop.id]).length;

  return (
    <div className="min-h-screen bg-muted pb-20">
      <ConfirmDialog
        open={confirmingComplete}
        title="Hoàn tất chuyến đi?"
        description="Hệ thống sẽ tạo kỷ niệm hành trình để cả đoàn lưu giữ hình ảnh và quyết toán chi tiêu."
        confirmLabel="Hoàn tất"
        onConfirm={confirmCompleteTrip}
        onClose={() => setConfirmingComplete(false)}
      />
      {/* Top Banner / Mobile Handoff on Desktop */}
      <section className="bg-primary px-4 py-6 text-white sm:px-6 lg:py-8">
        <div className="page-shell px-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/planner/${trip.id}`}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full bg-card/10 px-3.5 py-2 text-xs font-bold text-white/90 hover:bg-card/20"
            >
              <ArrowLeft size={14} />
              <span>Quay lại chỉnh sửa lịch trình</span>
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1.5 text-xs font-extrabold text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Chế độ đi đường (Road Mode)
            </span>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                {trip.startDate} → {trip.endDate} · {trip.days.length} ngày
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-4xl">
                {trip.title}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void copyMobileLink()}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-card/10 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-card/20 transition"
              >
                <Smartphone size={16} />
                <span>{copiedLink ? "Đã sao chép liên kết!" : "Mở trên điện thoại"}</span>
              </button>

              {trip.status === "COMPLETED" ? (
                <Link
                  href={`/memory/${trip.id}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <CheckCircle2 size={16} />
                  <span>Xem Kỷ niệm chuyến đi</span>
                </Link>
              ) : (trip.role === "OWNER" || trip.permission === "EDIT") && (
                <button
                  type="button"
                  onClick={() => void handleCompleteTrip()}
                  disabled={completingTrip}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>{completingTrip ? "Đang xử lý…" : "Hoàn tất chuyến đi"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="page-shell px-4 sm:px-6">
        {/* Honest Desktop Handoff Banner */}
        <section
          aria-labelledby="desktop-handoff-banner"
          className="surface-card -mt-4 border-l-4 border-l-primary p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary shrink-0">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="desktop-handoff-banner" className="text-sm font-extrabold text-foreground">
                Trải nghiệm tối ưu cho điện thoại khi đi đường
              </h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Giao diện đi đường được thiết kế nhỏ gọn, dễ thao tác một tay trên điện thoại khi đang di chuyển.
                Bạn có thể mở chỉ đường Google Maps trực tiếp cho từng điểm dừng, đánh dấu đã đến và gọi nhanh cứu hộ khẩn cấp.
              </p>
              <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground bg-muted p-2.5 rounded-lg">
                <AlertCircle size={14} className="text-foreground shrink-0" />
                <span>
                  <strong>Lưu ý:</strong> Tính năng chia sẻ vị trí (Consented Live Tracking) cho phép bạn chủ động bật/tắt để các thành viên trong đoàn có thể biết vị trí của nhau.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Consented Live Location Sharing Card */}
        <section className="surface-card mt-6 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSharingLocation ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
              <Navigation size={20} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-foreground">Chia sẻ vị trí với đoàn (Consented Live Tracking)</h3>
              <p className="text-xs text-muted-foreground">
                {isSharingLocation
                  ? "Vị trí GPS của bạn đang được chia sẻ cho các thành viên trong đoàn."
                  : "Chỉ chia sẻ khi bạn cho phép và có thể tắt bất cứ lúc nào."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void handleToggleLocationSharing()}
            className={`focus-ring rounded-xl px-4 py-2.5 text-xs font-bold transition ${
              isSharingLocation
                ? "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {isSharingLocation ? "Đang bật chia sẻ (Nhấn để tắt)" : "Bật chia sẻ vị trí"}
          </button>
        </section>

        {/* Emergency Assistance Quick Bar */}
        <section aria-labelledby="emergency-bar-title" className="mt-6">
          <h2 id="emergency-bar-title" className="sr-only">Hỗ trợ khẩn cấp</h2>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <a
              href="tel:113"
              className="focus-ring surface-card flex flex-col items-center justify-center p-3 text-center hover:bg-destructive/5 transition border-border"
            >
              <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                <ShieldAlert size={18} />
              </div>
              <span className="mt-1.5 text-xs font-bold text-foreground">CSGT / Công an</span>
              <span className="text-[11px] font-extrabold text-destructive">113</span>
            </a>
            <a
              href="tel:115"
              className="focus-ring surface-card flex flex-col items-center justify-center p-3 text-center hover:bg-primary/5 transition border-border"
            >
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <PhoneCall size={18} />
              </div>
              <span className="mt-1.5 text-xs font-bold text-foreground">Cấp cứu y tế</span>
              <span className="text-[11px] font-extrabold text-primary">115</span>
            </a>
            <a
              href="tel:116"
              className="focus-ring surface-card flex flex-col items-center justify-center p-3 text-center hover:bg-muted transition border-border"
            >
              <div className="rounded-full bg-muted p-2 text-foreground">
                <Navigation size={18} />
              </div>
              <span className="mt-1.5 text-xs font-bold text-foreground">Cứu hộ đường bộ</span>
              <span className="text-[11px] font-extrabold text-foreground">116</span>
            </a>
          </div>
        </section>

        {/* Day Selector */}
        <div className="mt-6">
          <nav aria-label="Chọn ngày hành trình" className="flex gap-2 overflow-x-auto pb-1">
            {trip.days.map((day, idx) => {
              const active = idx === dayIndex;
              return (
                <button
                  type="button"
                  key={day.id}
                  onClick={() => setDayIndex(idx)}
                  className={`focus-ring shrink-0 rounded-2xl px-4 py-2.5 text-left transition ${
                    active
                      ? "bg-primary text-white shadow-xs font-extrabold"
                      : "surface-card text-foreground hover:bg-background font-semibold"
                  }`}
                >
                  <span className="block text-xs uppercase opacity-80">Ngày {day.dayIndex}</span>
                  <span className="text-sm">{day.date}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Active Day Route & Stops List */}
        {activeDay && (
          <section className="mt-6 space-y-4" aria-labelledby="active-day-heading">
            <div className="surface-card flex items-center justify-between p-4 sm:p-5">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-primary">
                  Lộ trình Ngày {activeDay.dayIndex}
                </p>
                <h2 id="active-day-heading" className="mt-0.5 text-xl font-extrabold text-foreground">
                  {activeDay.date}
                </h2>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                Đã đến {completedStopsInDay}/{activeStops.length} điểm
              </span>
            </div>

            {activeStops.length === 0 ? (
              <div className="surface-card p-8 text-center">
                <MapPin className="mx-auto text-primary" size={32} />
                <h3 className="mt-3 text-lg font-extrabold text-foreground">
                  Chưa có điểm dừng cho ngày này
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Quay lại giao diện chỉnh sửa để thêm các điểm đến vào hành trình.
                </p>
                <Link
                  href={`/planner/${trip.id}`}
                  className="focus-ring mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-primary/90 transition"
                >
                  Thêm điểm dừng vào kế hoạch
                </Link>
              </div>
            ) : (
              <ol className="space-y-3">
                {activeStops.map((stop, index) => {
                  const isCheckedIn = !!checkIns[stop.id];
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${stop.latitude},${stop.longitude}`,
                  )}`;

                  return (
                    <li
                      key={stop.id}
                      className={`surface-card relative overflow-hidden p-4 sm:p-5 transition-all ${
                        isCheckedIn ? "opacity-75 bg-muted/60" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Stop Number Badge */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white ${
                            isCheckedIn ? "bg-emerald-600" : "bg-primary"
                          }`}
                        >
                          {isCheckedIn ? <CheckCircle2 size={18} /> : stop.stopIndex}
                        </div>

                        {/* Stop Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h3
                                className={`text-base font-extrabold text-foreground ${
                                  isCheckedIn ? "line-through opacity-75" : ""
                                }`}
                              >
                                {stop.name}
                              </h3>
                              <p className="mt-0.5 text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin size={12} className="shrink-0" />
                                <span className="truncate">{stop.address}</span>
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                isCheckedIn
                                  ? "bg-emerald-500/15 text-emerald-800"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {isCheckedIn ? "Đã đến" : `Chặng ${index + 1}`}
                            </span>
                          </div>

                          {stop.notes && (
                            <p className="mt-2.5 rounded-xl bg-muted p-2.5 text-xs text-muted-foreground leading-relaxed">
                              <strong>Ghi chú:</strong> {stop.notes}
                            </p>
                          )}

                          {/* Action Buttons: Check-in & Directions */}
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleCheckIn(stop.id)}
                              className={`focus-ring inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                                isCheckedIn
                                  ? "border border-border bg-card text-muted-foreground hover:bg-muted"
                                  : "bg-emerald-600 text-white shadow-xs hover:bg-emerald-700"
                              }`}
                            >
                              {isCheckedIn ? (
                                <>
                                  <Circle size={14} />
                                  <span>Đánh dấu chưa đến</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 size={14} />
                                  <span>Đã đến nơi</span>
                                </>
                              )}
                            </button>

                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="focus-ring inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition"
                            >
                              <ExternalLink size={14} />
                              <span>Mở chỉ đường Google Maps</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
