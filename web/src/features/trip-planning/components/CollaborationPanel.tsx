"use client";

import { useCallback, useEffect, useState } from "react";
import {
  changeMemberPermission,
  createInvitation,
  listInvitations,
  listMembers,
  removeMember,
  revokeInvitation,
} from "../api/trips";
import type { Invitation, Member } from "../api/trip-model";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PendingAction = "invite" | `member:${string}` | `invitation:${string}`;

export default function CollaborationPanel({ tripId }: { tripId: string }) {
  const [members, setMembers] = useState<readonly Member[]>([]);
  const [invitations, setInvitations] = useState<readonly Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"VIEW" | "EDIT">("VIEW");
  const [shareLink, setShareLink] = useState<string>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [pendingAction, setPendingAction] = useState<PendingAction>();

  const load = useCallback(async () => {
    const [nextMembers, nextInvitations] = await Promise.all([
      listMembers(tripId),
      listInvitations(tripId),
    ]);
    setMembers(nextMembers);
    setInvitations(nextInvitations);
  }, [tripId]);

  useEffect(() => {
    let active = true;
    Promise.all([listMembers(tripId), listInvitations(tripId)])
      .then(([nextMembers, nextInvitations]) => {
        if (!active) return;
        setMembers(nextMembers);
        setInvitations(nextInvitations);
        setError(undefined);
      })
      .catch((cause: unknown) => {
        if (active) setError(message(cause, "Không thể tải cộng tác viên."));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [tripId]);

  async function invite(event: React.FormEvent) {
    event.preventDefault();
    setPendingAction("invite");
    setError(undefined);
    try {
      const invitation = await createInvitation(tripId, email, permission);
      trackAnalytics("member_invited", { permission }, { dedupeKey: invitation.id });
      const link = `${window.location.origin}/trip-invitations/${encodeURIComponent(invitation.token)}`;
      setShareLink(link);
      setEmail("");
      await load();
      try {
        await navigator.clipboard?.writeText(link);
      } catch {
        // The visible link remains available when clipboard permission is denied.
      }
    } catch (cause) {
      setError(message(cause, "Không thể tạo lời mời."));
    } finally {
      setPendingAction(undefined);
    }
  }

  async function updateMember(userId: string, nextPermission: "VIEW" | "EDIT") {
    setPendingAction(`member:${userId}`);
    setError(undefined);
    try {
      await changeMemberPermission(tripId, userId, nextPermission);
      await load();
    } catch (cause) {
      setError(message(cause, "Không thể cập nhật quyền."));
    } finally {
      setPendingAction(undefined);
    }
  }

  async function remove(userId: string) {
    setPendingAction(`member:${userId}`);
    setError(undefined);
    try {
      await removeMember(tripId, userId);
      await load();
    } catch (cause) {
      setError(message(cause, "Không thể gỡ thành viên."));
    } finally {
      setPendingAction(undefined);
    }
  }

  async function revoke(invitationId: string) {
    setPendingAction(`invitation:${invitationId}`);
    setError(undefined);
    try {
      await revokeInvitation(tripId, invitationId);
      await load();
    } catch (cause) {
      setError(message(cause, "Không thể thu hồi lời mời."));
    } finally {
      setPendingAction(undefined);
    }
  }

  const activeMembers = members.filter((member) => member.status === "ACTIVE");

  return (
    <section aria-labelledby="collaboration-title">
      <h2 id="collaboration-title" className="text-2xl font-medium tracking-tight">
        Cộng tác viên
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Cùng lập kế hoạch với bạn đồng hành.</p>
      {error && <div className="mt-5"><FeedbackState kind="error" title="Không thể cập nhật cộng tác viên" description={error} actionLabel="Thử lại" onAction={() => void load().catch(() => undefined)} /></div>}

      <form onSubmit={(event) => void invite(event)} className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className="sr-only" htmlFor="invite-email">
          Email người được mời
        </label>
        <Input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-11 min-w-0 sm:flex-1"
          placeholder="email@example.com"
        />
        <select
          aria-label="Quyền lời mời"
          value={permission}
          onChange={(event) => setPermission(event.target.value as "VIEW" | "EDIT")}
          className="field min-h-11 bg-card sm:w-auto"
        >
          <option value="VIEW">Chỉ xem</option>
          <option value="EDIT">Có thể sửa</option>
        </select>
        <Button type="submit" disabled={pendingAction !== undefined} className="min-h-11">
          {pendingAction === "invite" ? "Đang mời…" : "Mời"}
        </Button>
      </form>

      {shareLink && (
        <div className="mt-3 rounded-lg bg-muted p-3 text-sm text-success" role="status">
          Đã tạo lời mời. Liên kết có thể đã được sao chép; bạn cũng có thể{" "}
          <a className="font-medium underline" href={shareLink}>
            mở liên kết mời
          </a>
          .
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-muted-foreground">Đang tải thành viên…</p>
      ) : (
        <ul className="mt-6 grid gap-1" aria-label="Thành viên chuyến đi">
          {activeMembers.map((member, index) => {
            const memberBusy = pendingAction === `member:${member.userId}`;
            return (
              <li
                key={member.userId}
                className={`flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}
              >
                <span className="min-w-0">
                  <strong className="font-medium">{member.role === "OWNER" ? "Chủ chuyến đi" : "Thành viên"}</strong>
                  {member.role !== "OWNER" && <span className="ml-2 text-muted-foreground">{member.userId}</span>}
                </span>
                {member.role === "MEMBER" && (
                  <span className="flex gap-2">
                    <select
                      aria-label={`Quyền của ${member.userId}`}
                      disabled={memberBusy}
                      value={member.permission}
                      onChange={(event) =>
                        void updateMember(
                          member.userId,
                          event.target.value as "VIEW" | "EDIT",
                        )
                      }
                      className="field min-h-9 w-auto bg-card py-1"
                    >
                      <option value="VIEW">Chỉ xem</option>
                      <option value="EDIT">Có thể sửa</option>
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={memberBusy}
                      onClick={() => void remove(member.userId)}
                      className="text-destructive hover:text-destructive"
                    >
                      {memberBusy ? "Đang xử lý…" : "Gỡ"}
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {invitations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium">Lời mời</h3>
          <ul className="mt-2 divide-y divide-border">
            {invitations.map((invitation) => {
              const invitationBusy = pendingAction === `invitation:${invitation.id}`;
              return (
                <li key={invitation.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 text-sm">
                  <span>
                    {invitation.inviteeEmail} · {invitation.permission} · {invitation.status}
                  </span>
                  {invitation.status === "PENDING" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={invitationBusy}
                      onClick={() => void revoke(invitation.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      {invitationBusy ? "Đang thu hồi…" : "Thu hồi"}
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function message(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}
