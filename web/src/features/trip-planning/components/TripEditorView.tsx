"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Check, ChevronDown, ChevronUp, Copy, Navigation, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GatewayApiError } from "@/features/trip-planning/api/gateway-request";
import {
  getTrip,
  moveStop,
  removeStop,
  reorderStops,
  updateStop,
  updateTripVisibility,
} from "@/features/trip-planning/api/trips";
import type { TripDetail } from "@/features/trip-planning/api/trip-model";
import PlaceSearch from "./PlaceSearch";
import CollaborationPanel from "./CollaborationPanel";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false, loading: () => <div className="h-[22rem] animate-pulse rounded-xl bg-muted p-6 text-sm text-muted-foreground">Đang tải bản đồ…</div> });
type State = { kind: "loading" } | { kind: "ready"; trip: TripDetail } | { kind: "missing" } | { kind: "forbidden" } | { kind: "error"; message: string };

export default function TripEditorView({ tripId }: { tripId: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [dayIndex, setDayIndex] = useState(0);
  const [mutationError, setMutationError] = useState<string>();
  const [conflictNotice, setConflictNotice] = useState<string>();
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string>();
  const [copiedLink, setCopiedLink] = useState(false);
  const [busyStopId, setBusyStopId] = useState<string>();
  const [stopToRemove, setStopToRemove] = useState<{ id: string; name: string }>();

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try { setState({ kind: "ready", trip: await getTrip(tripId) }); }
    catch (error) {
      if (error instanceof GatewayApiError && error.code === "TRIP_NOT_FOUND") setState({ kind: "missing" });
      else if (error instanceof GatewayApiError && error.code === "FORBIDDEN") setState({ kind: "forbidden" });
      else setState({ kind: "error", message: error instanceof Error ? error.message : "Không thể tải lịch trình." });
    }
  }, [tripId]);
  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);
  useEffect(() => { if (state.kind === "ready") trackAnalytics("trip_edit_resumed", { role: state.trip.role, permission: state.trip.permission }, { dedupeKey: state.trip.id }); }, [state]);

  if (state.kind === "loading") return <div className="page-shell w-full py-12" aria-busy="true"><div className="h-10 w-72 animate-pulse rounded bg-muted" /><div className="mt-8 h-80 animate-pulse rounded-xl bg-muted" /></div>;
  if (state.kind === "missing" || state.kind === "forbidden") return <div className="page-shell py-16"><FeedbackState kind={state.kind === "missing" ? "empty" : "permission"} title={state.kind === "missing" ? "Không tìm thấy chuyến đi" : "Bạn không có quyền truy cập"} description={state.kind === "missing" ? "Chuyến đi có thể đã bị xóa hoặc không còn tồn tại." : "Bạn cần lời mời hợp lệ để xem lịch trình này."}><Link href="/dashboard" className="focus-ring text-sm font-bold text-primary hover:underline">Về danh sách chuyến đi</Link></FeedbackState></div>;
  if (state.kind === "error") return <div className="page-shell py-16"><FeedbackState kind="error" title="Không thể tải lịch trình" description={state.message} actionLabel="Thử lại" onAction={() => void load()} /></div>;
  const { trip } = state;
  const activeDay = trip.days[dayIndex]!;
  const canEdit = trip.role === "OWNER" || trip.permission === "EDIT";
  const totalStops = trip.days.reduce((total, day) => total + day.stops.length, 0);
  const completion = trip.days.length ? Math.round((trip.days.filter((day) => day.stops.length > 0).length / trip.days.length) * 100) : 0;

  async function remove(stopId: string) {
    setMutationError(undefined);
    setBusyStopId(stopId);
    try { await removeStop(trip.id, stopId); await load(); }
    catch (error) { setMutationError(error instanceof Error ? error.message : "Không thể xóa điểm dừng."); }
    finally { setBusyStopId(undefined); }
  }

  async function reorder(stopId: string, direction: -1 | 1) {
    const stops = [...activeDay.stops];
    const from = stops.findIndex((stop) => stop.id === stopId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= stops.length) return;
    [stops[from], stops[to]] = [stops[to]!, stops[from]!];
    setMutationError(undefined);
    setConflictNotice(undefined);
    setBusyStopId(stopId);
    try {
      await reorderStops(trip.id, activeDay.id, stops.map((stop) => stop.id), trip.version);
      await load();
    } catch (error) {
      if (error instanceof GatewayApiError && (error.code === "TRIP_VERSION_CONFLICT" || error.message.includes("version"))) {
        setConflictNotice("Hành trình vừa được cập nhật bởi thành viên khác. Đang tự động làm mới để lấy dữ liệu mới nhất...");
        await load();
      } else {
        setMutationError(error instanceof Error ? error.message : "Không thể đổi thứ tự điểm dừng.");
      }
    } finally {
      setBusyStopId(undefined);
    }
  }

  async function move(stopId: string, targetDayId: string) {
    setMutationError(undefined);
    setConflictNotice(undefined);
    setBusyStopId(stopId);
    try {
      await moveStop(trip.id, stopId, targetDayId, 1, trip.version);
      await load();
    } catch (error) {
      if (error instanceof GatewayApiError && (error.code === "TRIP_VERSION_CONFLICT" || error.message.includes("version"))) {
        setConflictNotice("Hành trình vừa được cập nhật bởi thành viên khác. Đang tự động làm mới để lấy dữ liệu mới nhất...");
        await load();
      } else {
        setMutationError(error instanceof Error ? error.message : "Không thể chuyển ngày cho điểm dừng.");
      }
    } finally {
      setBusyStopId(undefined);
    }
  }

  async function handleVisibilityChange(newVisibility: "PRIVATE" | "UNLISTED" | "PUBLISHED") {
    if (newVisibility === trip.visibility) return;
    setVisibilitySaving(true);
    setVisibilityError(undefined);
    try {
      await updateTripVisibility(trip.id, newVisibility);
      trackAnalytics("trip_visibility_updated", { visibility: newVisibility }, { dedupeKey: trip.id });
      await load();
    } catch (err) {
      if (err instanceof GatewayApiError && err.code === "TRIP_INCOMPLETE_FOR_PUBLICATION") {
        setVisibilityError("Chuyến đi cần có ít nhất một điểm dừng trước khi có thể công khai.");
      } else {
        setVisibilityError(err instanceof Error ? err.message : "Không thể cập nhật quyền hiển thị.");
      }
    } finally {
      setVisibilitySaving(false);
    }
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/planner/${trip.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // clipboard access fallback
    }
  }

  const visibilityLabel = trip.visibility === "PUBLISHED" ? "Công khai" : trip.visibility === "UNLISTED" ? "Có liên kết" : "Riêng tư";
  const roleLabel = trip.role === "OWNER" ? "Chủ chuyến đi" : canEdit ? "Thành viên có thể chỉnh sửa" : "Thành viên chỉ xem";

  return (
    <div className="page-shell px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/dashboard" className="focus-ring inline-flex min-h-11 items-center rounded text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          ← Chuyến đi của bạn
        </Link>
        <Button asChild className="min-h-11">
          <Link href={`/road/${trip.id}`}>
            <Navigation aria-hidden="true" /> Bắt đầu chuyến đi
          </Link>
        </Button>
      </div>

      <header className="mt-6">
        <p className="text-sm text-muted-foreground">
          {roleLabel} · {visibilityLabel}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">{trip.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {trip.description || "Thêm các điểm dừng để biến ý tưởng thành một hành trình rõ ràng."}
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          <Fact label="Thời gian" value={`${trip.days.length} ngày`} />
          <Fact label="Điểm dừng" value={`${totalStops} nơi`} />
          <Fact label="Ngân sách" value={`${trip.budgetAmount.toLocaleString("vi-VN")} ${trip.currency}`} />
          <Fact label="Hoàn thiện" value={`${completion}%`} note={`${trip.days.filter((day) => day.stops.length > 0).length}/${trip.days.length} ngày có điểm dừng`} />
        </dl>
      </header>

      {conflictNotice && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-lg bg-muted p-4 text-sm">
          <span>{conflictNotice}</span>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConflictNotice(undefined)}>
            Đóng
          </Button>
        </div>
      )}

      {trip.role === "OWNER" && (
        <section className="mt-10 rounded-xl bg-muted p-5 sm:p-6" aria-labelledby="visibility-controls-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 id="visibility-controls-title" className="text-lg font-medium">
                Chế độ chia sẻ
              </h2>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                {trip.visibility === "PUBLISHED"
                  ? "Chuyến đi đang hiển thị công khai trên Khám phá cộng đồng. Bất kỳ ai cũng có thể xem và nhân bản."
                  : trip.visibility === "UNLISTED"
                    ? "Chuyến đi không xuất hiện công khai nhưng bất kỳ ai có đường liên kết đều xem được."
                    : "Chuyến đi hoàn toàn riêng tư. Chỉ bạn và thành viên được mời mới có quyền truy cập."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Chọn chế độ hiển thị"
                disabled={visibilitySaving}
                value={trip.visibility ?? "PRIVATE"}
                onChange={(e) => void handleVisibilityChange(e.target.value as "PRIVATE" | "UNLISTED" | "PUBLISHED")}
                className="field min-h-11 min-w-44 bg-card"
              >
                <option value="PRIVATE">Riêng tư</option>
                <option value="UNLISTED">Có liên kết</option>
                <option value="PUBLISHED">Công khai cộng đồng</option>
              </select>
              {(trip.visibility === "UNLISTED" || trip.visibility === "PUBLISHED") && (
                <Button type="button" variant="outline" className="min-h-11" onClick={() => void copyShareLink()}>
                  {copiedLink ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copiedLink ? "Đã sao chép!" : "Sao chép liên kết"}
                </Button>
              )}
            </div>
          </div>
          {visibilityError && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {visibilityError}
            </p>
          )}
        </section>
      )}

      <div className="mt-10 grid gap-8 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <nav aria-label="Các ngày trong chuyến đi" className="h-fit xl:sticky xl:top-6">
          <h2 className="pb-3 text-sm text-muted-foreground">Lịch trình</h2>
          <div className="flex gap-1.5 overflow-x-auto xl:flex-col xl:overflow-visible">
            {trip.days.map((day, index) => (
              <button
                type="button"
                key={day.id}
                aria-pressed={index === dayIndex}
                onClick={() => setDayIndex(index)}
                className={`focus-ring flex min-h-16 min-w-32 shrink-0 flex-col items-start justify-center rounded-md px-4 text-left transition-colors xl:w-full ${index === dayIndex ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-border"}`}
              >
                <span className="text-base">Ngày {day.dayIndex}</span>
                <span className="text-sm tabular-nums opacity-80">
                  {day.date} · {day.stops.length} điểm
                </span>
              </button>
            ))}
          </div>
        </nav>

        <div className="min-w-0 space-y-10">
          <section aria-labelledby="day-title">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="day-title" className="text-2xl font-medium tracking-tight">
                Ngày {activeDay.dayIndex}
                <span className="ml-3 text-base font-normal tabular-nums text-muted-foreground">{activeDay.date}</span>
              </h2>
              {canEdit && <span className="text-sm text-muted-foreground">Có thể thêm và sắp xếp điểm dừng</span>}
            </div>
            <div className="mt-5">
              {mutationError && (
                <p role="alert" className="mb-4 text-sm text-destructive">
                  {mutationError}{" "}
                  <button type="button" onClick={() => void load()} className="focus-ring rounded font-medium underline">
                    Tải lại
                  </button>
                </p>
              )}
              {activeDay.stops.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <h3 className="text-lg font-medium">Ngày này chưa có điểm dừng</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{canEdit ? "Tìm địa điểm bên dưới để bắt đầu xây hành trình." : "Chủ chuyến đi chưa thêm địa điểm nào."}</p>
                </div>
              ) : (
                <ol className="grid gap-1">
                  {activeDay.stops.map((stop, index) => (
                    <StopCard
                      key={stop.id}
                      stop={stop}
                      striped={index % 2 === 0}
                      editable={canEdit}
                      onRefresh={load}
                      controls={
                        <>
                          <Button type="button" variant="outline" size="sm" aria-label={`Đưa ${stop.name} lên`} disabled={index === 0 || busyStopId !== undefined} onClick={() => void reorder(stop.id, -1)}>
                            <ChevronUp aria-hidden="true" /> Lên
                          </Button>
                          <Button type="button" variant="outline" size="sm" aria-label={`Đưa ${stop.name} xuống`} disabled={index === activeDay.stops.length - 1 || busyStopId !== undefined} onClick={() => void reorder(stop.id, 1)}>
                            <ChevronDown aria-hidden="true" /> Xuống
                          </Button>
                          {trip.days.length > 1 && (
                            <select
                              aria-label={`Chuyển ${stop.name} sang ngày khác`}
                              value=""
                              disabled={busyStopId !== undefined}
                              onChange={(event) => {
                                if (event.target.value) void move(stop.id, event.target.value);
                              }}
                              className="field min-h-8 w-auto bg-card py-1 text-sm"
                            >
                              <option value="">Chuyển sang ngày…</option>
                              {trip.days
                                .filter((day) => day.id !== activeDay.id)
                                .map((day) => (
                                  <option key={day.id} value={day.id}>
                                    Ngày {day.dayIndex} · {day.date}
                                  </option>
                                ))}
                            </select>
                          )}
                          <Button type="button" variant="outline" size="sm" aria-label={`Xóa ${stop.name}`} disabled={busyStopId !== undefined} className="text-destructive hover:text-destructive" onClick={() => setStopToRemove({ id: stop.id, name: stop.name })}>
                            <Trash2 aria-hidden="true" /> Xóa
                          </Button>
                        </>
                      }
                    />
                  ))}
                </ol>
              )}
              {canEdit && <PlaceSearch tripId={trip.id} dayId={activeDay.id} stopCount={activeDay.stops.length} onAdded={() => void load()} />}
            </div>
          </section>

          <section aria-labelledby="map-title">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 id="map-title" className="text-lg font-medium">
                Bản đồ ngày {activeDay.dayIndex}
              </h2>
              <span className="text-sm tabular-nums text-muted-foreground">{activeDay.stops.length} điểm</span>
            </div>
            <div className="overflow-hidden rounded-xl bg-muted">
              <RouteMap stops={activeDay.stops} />
            </div>
          </section>
        </div>
      </div>

      {trip.role === "OWNER" && (
        <div className="mt-12">
          <CollaborationPanel tripId={trip.id} />
        </div>
      )}

      <ConfirmDialog
        open={stopToRemove !== undefined}
        title="Xóa điểm dừng này?"
        description={stopToRemove ? `“${stopToRemove.name}” sẽ bị xóa khỏi lịch trình của Ngày ${activeDay.dayIndex}.` : ""}
        confirmLabel="Xóa điểm dừng"
        busy={busyStopId !== undefined}
        onClose={() => setStopToRemove(undefined)}
        onConfirm={() => {
          const target = stopToRemove;
          if (!target) return;
          void remove(target.id).finally(() => setStopToRemove(undefined));
        }}
      />
    </div>
  );
}

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-2xl font-medium tabular-nums tracking-tight">{value}</dd>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

function StopCard({ stop, striped, editable, controls, onRefresh }: { stop: TripDetail["days"][number]["stops"][number]; striped: boolean; editable: boolean; controls: ReactNode; onRefresh: () => Promise<void> }) {
  const { tripId } = useParams<{ tripId: string }>();
  const [notes, setNotes] = useState(stop.notes ?? "");
  const [status, setStatus] = useState<"saved" | "saving" | "failed">("saved");
  useEffect(() => {
    if (!editable || notes === (stop.notes ?? "")) return;
    const timer = window.setTimeout(async () => {
      setStatus("saving");
      try {
        await updateStop(tripId, { ...stop, notes: notes || null });
        setStatus("saved");
        await onRefresh();
      } catch {
        setStatus("failed");
      }
    }, 600);
    return () => window.clearTimeout(timer);
  }, [editable, notes, onRefresh, stop, tripId]);

  return (
    <li className={`flex gap-4 rounded-lg px-4 py-4 sm:px-5 ${striped ? "bg-muted" : "bg-muted/50"}`}>
      <span className="w-7 shrink-0 pt-0.5 text-xl tabular-nums">{stop.stopIndex}</span>
      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-medium">{stop.name}</h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{stop.address}</p>
        {editable ? (
          <label className="mt-4 block text-sm font-medium">
            Ghi chú
            <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1 min-h-20 bg-card" aria-describedby={`${stop.id}-save`} placeholder="Mẹo đường đi, thời điểm phù hợp…" />
          </label>
        ) : (
          stop.notes && <p className="mt-3 text-sm text-muted-foreground">{stop.notes}</p>
        )}
        <p id={`${stop.id}-save`} role="status" aria-live="polite" className={`mt-2 text-xs ${status === "failed" ? "text-destructive" : "text-muted-foreground"}`}>
          {status === "saving" ? "Đang lưu ghi chú…" : status === "failed" ? "Không thể lưu. Chỉnh sửa vẫn được giữ ở đây; hãy thử lại hoặc tải lại." : "Đã lưu"}
        </p>
        {editable && <div className="mt-3 flex flex-wrap gap-2">{controls}</div>}
      </div>
    </li>
  );
}
