"use client";
import { toast } from "@/components/ui/sonner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Circle, ExternalLink, MapPin, Navigation, Smartphone } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import {
  getTrip,
  updateTripLocation,
  updateTripStatus,
} from "@/features/trip-planning/api/trips";
import type { TripDetail } from "@/features/trip-planning/api/trip-model";
import FeedbackState from "@/components/ui/FeedbackState";
import { trackAnalytics } from "@/lib/analytics/analytics";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false, loading: () => <div className="h-[22rem] animate-pulse rounded-xl bg-muted p-6 text-sm text-muted-foreground">Đang tải bản đồ…</div> });

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
      <div className="page-shell w-full px-4 py-10 sm:px-6" aria-busy="true">
        <div className="h-10 w-72 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-80 animate-pulse rounded-xl bg-muted" />
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
          <Link href="/dashboard" className="focus-ring text-sm font-medium underline underline-offset-4">
            Về danh sách chuyến đi
          </Link>
        </FeedbackState>
      </div>
    );
  }

  if (state.kind === "error") {
    return (
      <div className="page-shell py-16">
        <FeedbackState kind="error" title="Không thể tải chuyến đi" description={state.message} actionLabel="Thử lại" onAction={() => void load()} />
      </div>
    );
  }

  const { trip } = state;
  const activeDay = trip.days[dayIndex] ?? trip.days[0];
  const activeStops = activeDay ? activeDay.stops : [];
  const completedStopsInDay = activeStops.filter((stop) => checkIns[stop.id]).length;
  const canComplete = trip.role === "OWNER" || trip.permission === "EDIT";

  return (
    <div className="page-shell px-4 py-6 sm:px-6 sm:py-10">
      <ConfirmDialog
        open={confirmingComplete}
        title="Hoàn tất chuyến đi?"
        description="Hệ thống sẽ tạo kỷ niệm hành trình để cả đoàn lưu giữ hình ảnh và quyết toán chi tiêu."
        confirmLabel="Hoàn tất"
        onConfirm={confirmCompleteTrip}
        onClose={() => setConfirmingComplete(false)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/planner/${trip.id}`} className="focus-ring inline-flex min-h-11 items-center gap-1.5 rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" /> Quay lại chỉnh sửa lịch trình
        </Link>
        <p className="inline-flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          Chế độ đi đường (Road Mode)
        </p>
      </div>

      <header className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm tabular-nums text-muted-foreground">
            {trip.startDate} → {trip.endDate} · {trip.days.length} ngày
          </p>
          <h1 className="mt-1 text-3xl font-medium tracking-tight sm:text-4xl">{trip.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" className="min-h-11" onClick={() => void copyMobileLink()}>
            <Smartphone aria-hidden="true" />
            {copiedLink ? "Đã sao chép liên kết!" : "Mở trên điện thoại"}
          </Button>
          {trip.status === "COMPLETED" ? (
            <Button asChild className="min-h-11">
              <Link href={`/memory/${trip.id}`}>
                <CheckCircle2 aria-hidden="true" /> Xem Kỷ niệm chuyến đi
              </Link>
            </Button>
          ) : (
            canComplete && (
              <Button type="button" className="min-h-11" onClick={() => void handleCompleteTrip()} disabled={completingTrip}>
                <CheckCircle2 aria-hidden="true" />
                {completingTrip ? "Đang xử lý…" : "Hoàn tất chuyến đi"}
              </Button>
            )
          )}
        </div>
      </header>

      <section aria-labelledby="desktop-handoff-banner" className="mt-8 rounded-xl bg-muted p-5">
        <h2 id="desktop-handoff-banner" className="text-base font-medium">
          Trải nghiệm tối ưu cho điện thoại khi đi đường
        </h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Giao diện đi đường được thiết kế nhỏ gọn, dễ thao tác một tay trên điện thoại khi đang di chuyển. Bạn có thể mở chỉ đường Google Maps trực tiếp cho từng điểm dừng, đánh dấu đã đến và gọi nhanh cứu hộ khẩn cấp.
        </p>
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            <strong className="font-medium text-foreground">Lưu ý:</strong> Tính năng chia sẻ vị trí (Consented Live Tracking) cho phép bạn chủ động bật/tắt để các thành viên trong đoàn có thể biết vị trí của nhau.
          </span>
        </p>
      </section>

      <section aria-labelledby="location-sharing-title" className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-muted p-5">
        <div className="min-w-0">
          <h3 id="location-sharing-title" className="text-base font-medium">
            Chia sẻ vị trí với đoàn (Consented Live Tracking)
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSharingLocation ? "Vị trí GPS của bạn đang được chia sẻ cho các thành viên trong đoàn." : "Chỉ chia sẻ khi bạn cho phép và có thể tắt bất cứ lúc nào."}
          </p>
        </div>
        <Button type="button" variant={isSharingLocation ? "default" : "outline"} className="min-h-11" aria-pressed={isSharingLocation} onClick={() => void handleToggleLocationSharing()}>
          <Navigation aria-hidden="true" />
          {isSharingLocation ? "Đang bật chia sẻ (Nhấn để tắt)" : "Bật chia sẻ vị trí"}
        </Button>
      </section>

      <section aria-labelledby="emergency-bar-title" className="mt-4">
        <h2 id="emergency-bar-title" className="sr-only">Hỗ trợ khẩn cấp</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { number: "113", label: "CSGT / Công an" },
            { number: "115", label: "Cấp cứu y tế" },
            { number: "116", label: "Cứu hộ đường bộ" },
          ].map((item) => (
            <a key={item.number} href={`tel:${item.number}`} className="focus-ring flex min-h-20 flex-col justify-center rounded-xl bg-muted px-4 py-3 transition-colors hover:bg-border">
              <span className="text-3xl font-medium tabular-nums tracking-tight">{item.number}</span>
              <span className="text-sm text-muted-foreground">{item.label}</span>
            </a>
          ))}
        </div>
      </section>

      <nav aria-label="Chọn ngày hành trình" className="mt-10 flex gap-1.5 overflow-x-auto pb-1">
        {trip.days.map((day, idx) => (
          <button
            type="button"
            key={day.id}
            aria-pressed={idx === dayIndex}
            onClick={() => setDayIndex(idx)}
            className={`focus-ring flex min-h-16 min-w-32 shrink-0 flex-col items-start justify-center rounded-md px-4 text-left transition-colors ${idx === dayIndex ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-border"}`}
          >
            <span className="text-base">Ngày {day.dayIndex}</span>
            <span className="text-sm tabular-nums opacity-80">{day.date}</span>
          </button>
        ))}
      </nav>

      {activeDay && (
        <section className="mt-8" aria-labelledby="active-day-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="active-day-heading" className="text-2xl font-medium tracking-tight">
              Lộ trình Ngày {activeDay.dayIndex}
              <span className="ml-3 text-base font-normal tabular-nums text-muted-foreground">{activeDay.date}</span>
            </h2>
            <p className="text-sm tabular-nums text-muted-foreground">
              Đã đến {completedStopsInDay}/{activeStops.length} điểm
            </p>
          </div>

          {activeStops.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <h3 className="text-lg font-medium">Chưa có điểm dừng cho ngày này</h3>
              <p className="mt-1 text-sm text-muted-foreground">Quay lại giao diện chỉnh sửa để thêm các điểm đến vào hành trình.</p>
              <Button asChild className="mt-5 min-h-11">
                <Link href={`/planner/${trip.id}`}>Thêm điểm dừng vào kế hoạch</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="mt-5 overflow-hidden rounded-xl bg-muted">
                <RouteMap stops={activeStops} />
              </div>
              <ol className="mt-5 grid gap-1">
                {activeStops.map((stop, index) => {
                  const isCheckedIn = !!checkIns[stop.id];
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${stop.latitude},${stop.longitude}`)}`;
                  return (
                    <li key={stop.id} className={`flex gap-4 rounded-lg px-4 py-4 sm:px-5 ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                      <span className="w-7 shrink-0 pt-0.5 text-xl tabular-nums">{isCheckedIn ? <CheckCircle2 className="size-6 text-success" aria-hidden="true" /> : stop.stopIndex}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className={`text-lg font-medium ${isCheckedIn ? "text-muted-foreground line-through" : ""}`}>{stop.name}</h3>
                          <span className={`text-sm ${isCheckedIn ? "text-success" : "text-muted-foreground"}`}>{isCheckedIn ? "Đã đến" : `Chặng ${index + 1}`}</span>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">{stop.address}</span>
                        </p>
                        {stop.notes && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            <strong className="font-medium text-foreground">Ghi chú:</strong> {stop.notes}
                          </p>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <Button type="button" variant={isCheckedIn ? "outline" : "default"} className="min-h-11" onClick={() => toggleCheckIn(stop.id)}>
                            {isCheckedIn ? <Circle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}
                            {isCheckedIn ? "Đánh dấu chưa đến" : "Đã đến nơi"}
                          </Button>
                          <Button asChild variant="outline" className="min-h-11">
                            <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink aria-hidden="true" /> Mở chỉ đường Google Maps
                            </a>
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </section>
      )}
    </div>
  );
}
