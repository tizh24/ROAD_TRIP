"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GatewayApiError } from "../api/gateway-request";
import { getInvitation, respondToInvitation } from "../api/trips";
import type { Invitation } from "../api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";

export default function InvitationLandingView({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<Invitation>(); const [error, setError] = useState<string>(); const [busy, setBusy] = useState(false);
  useEffect(() => { void getInvitation(token).then(setInvitation).catch((cause: unknown) => setError(cause instanceof GatewayApiError ? cause.message : "Không thể tải lời mời.")); }, [token]);
  async function respond(action: "accept" | "decline") { setBusy(true); setError(undefined); try { const result = await respondToInvitation(token, action); setInvitation(result); if (action === "accept") trackAnalytics("member_invitation_accepted", { permission: result.permission }, { dedupeKey: result.id }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật lời mời."); } finally { setBusy(false); } }
  if (error) return <div className="page-shell max-w-lg py-20"><FeedbackState kind="error" title="Lời mời không khả dụng" description={error}><Link className="focus-ring mt-2 inline-block font-bold text-primary underline" href="/dashboard">Về chuyến đi</Link></FeedbackState></div>;
  if (!invitation) return <div className="page-shell max-w-lg py-20" aria-busy="true"><div className="surface-card h-48 animate-pulse" /></div>;
  const pending=invitation.status === "PENDING";
  return <div className="page-shell max-w-lg py-12 sm:py-20"><section className="surface-card p-6 sm:p-8"><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-foreground">Cộng tác hành trình</p><h1 className="mt-2 text-2xl font-semibold text-foreground">Lời mời chuyến đi</h1><p className="mt-3 text-muted-foreground">Bạn được mời với quyền {invitation.permission === "EDIT" ? "chỉnh sửa" : "chỉ xem"}.</p><p className="mt-2 text-sm text-muted-foreground" aria-live="polite">Trạng thái: {invitation.status}</p>{pending && <div className="mt-6 flex flex-col gap-3 sm:flex-row"><button disabled={busy} onClick={() => void respond("accept")} className="focus-ring rounded-xl bg-primary px-4 py-3 font-bold text-white shadow-xs hover:bg-primary/90 disabled:opacity-50">Chấp nhận</button><button disabled={busy} onClick={() => void respond("decline")} className="focus-ring rounded-xl border border-border px-4 py-3 font-bold text-foreground hover:bg-muted disabled:opacity-50">Từ chối</button></div>}{invitation.status === "ACCEPTED" && <Link className="focus-ring mt-6 inline-block font-bold text-primary underline" href={`/planner/${invitation.tripId}`}>Mở chuyến đi</Link>}{invitation.status !== "ACCEPTED" && <Link className="focus-ring mt-6 inline-block font-bold text-primary underline" href="/dashboard">Về danh sách chuyến đi</Link>}</section></div>;
}
