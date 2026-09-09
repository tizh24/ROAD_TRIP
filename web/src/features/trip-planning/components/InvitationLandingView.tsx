"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GatewayApiError } from "../api/gateway-request";
import { getInvitation, respondToInvitation } from "../api/trips";
import type { Invitation } from "../api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";

export default function InvitationLandingView({ token }: { token: string }) {
  const [invitation, setInvitation] = useState<Invitation>(); const [error, setError] = useState<string>(); const [busy, setBusy] = useState(false);
  useEffect(() => { void getInvitation(token).then(setInvitation).catch((cause: unknown) => setError(cause instanceof GatewayApiError ? cause.message : "Không thể tải lời mời.")); }, [token]);
  async function respond(action: "accept" | "decline") { setBusy(true); setError(undefined); try { const result = await respondToInvitation(token, action); setInvitation(result); if (action === "accept") trackAnalytics("member_invitation_accepted", { permission: result.permission }, { dedupeKey: result.id }); } catch (cause) { setError(cause instanceof Error ? cause.message : "Không thể cập nhật lời mời."); } finally { setBusy(false); } }
  if (error) return <main className="mx-auto max-w-lg px-6 py-20"><h1 className="text-h2">Lời mời không khả dụng</h1><p className="mt-3 text-gray-600">{error}</p><Link className="mt-6 inline-block font-bold text-primary underline" href="/trips">Về chuyến đi</Link></main>;
  if (!invitation) return <main className="mx-auto max-w-lg px-6 py-20">Đang tải lời mời…</main>;
  const pending=invitation.status === "PENDING";
  return <main className="mx-auto max-w-lg px-6 py-20"><h1 className="text-h2 text-gray-900">Lời mời chuyến đi</h1><p className="mt-3 text-gray-600">Bạn được mời với quyền {invitation.permission === "EDIT" ? "chỉnh sửa" : "chỉ xem"}.</p><p className="mt-2 text-sm text-gray-500">Trạng thái: {invitation.status}</p>{pending && <div className="mt-6 flex gap-3"><button disabled={busy} onClick={() => void respond("accept")} className="rounded-xl bg-primary px-4 py-3 font-bold text-white disabled:opacity-50">Chấp nhận</button><button disabled={busy} onClick={() => void respond("decline")} className="rounded-xl border px-4 py-3 font-bold disabled:opacity-50">Từ chối</button></div>}{invitation.status === "ACCEPTED" && <Link className="mt-6 inline-block font-bold text-primary underline" href={`/trips/${invitation.tripId}`}>Mở chuyến đi</Link>}{invitation.status !== "ACCEPTED" && <Link className="mt-6 inline-block font-bold text-primary underline" href="/trips">Về danh sách chuyến đi</Link>}</main>;
}
