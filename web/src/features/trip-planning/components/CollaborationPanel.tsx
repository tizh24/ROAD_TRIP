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
    <section
      className="mt-8 rounded-2xl border border-gray-200 bg-white p-6"
      aria-labelledby="collaboration-title"
    >
      <h2 id="collaboration-title" className="text-xl font-bold text-gray-900">
        Cộng tác viên
      </h2>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}{" "}
          <button
            type="button"
            onClick={() => void load().catch(() => undefined)}
            className="font-bold underline"
          >
            Thử lại
          </button>
        </p>
      )}

      <form onSubmit={(event) => void invite(event)} className="mt-4 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="invite-email">
          Email người được mời
        </label>
        <input
          id="invite-email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="field flex-1 bg-white"
          placeholder="email@example.com"
        />
        <select
          aria-label="Quyền lời mời"
          value={permission}
          onChange={(event) => setPermission(event.target.value as "VIEW" | "EDIT")}
          className="rounded-lg border px-3"
        >
          <option value="VIEW">Chỉ xem</option>
          <option value="EDIT">Có thể sửa</option>
        </select>
        <button
          disabled={pendingAction !== undefined}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          {pendingAction === "invite" ? "Đang mời…" : "Mời"}
        </button>
      </form>

      {shareLink && (
        <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-900" role="status">
          Đã tạo lời mời. Liên kết có thể đã được sao chép; bạn cũng có thể{" "}
          <a className="font-bold underline" href={shareLink}>
            mở liên kết mời
          </a>
          .
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-gray-600">Đang tải thành viên…</p>
      ) : (
        <ul className="mt-6 space-y-3" aria-label="Thành viên chuyến đi">
          {activeMembers.map((member) => {
            const memberBusy = pendingAction === `member:${member.userId}`;
            return (
              <li
                key={member.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50 p-3 text-sm"
              >
                <span>
                  <strong>{member.role === "OWNER" ? "Chủ chuyến đi" : "Thành viên"}</strong>
                  <span className="ml-2 text-gray-600">{member.userId}</span>
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
                      className="rounded border px-2"
                    >
                      <option value="VIEW">Chỉ xem</option>
                      <option value="EDIT">Có thể sửa</option>
                    </select>
                    <button
                      type="button"
                      disabled={memberBusy}
                      onClick={() => void remove(member.userId)}
                      className="rounded border border-red-200 px-2 text-red-700 disabled:opacity-50"
                    >
                      {memberBusy ? "Đang xử lý…" : "Gỡ"}
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {invitations.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">Lời mời</h3>
          <ul className="mt-2 space-y-2">
            {invitations.map((invitation) => {
              const invitationBusy = pendingAction === `invitation:${invitation.id}`;
              return (
                <li key={invitation.id} className="flex flex-wrap justify-between gap-2 text-sm">
                  <span>
                    {invitation.inviteeEmail} · {invitation.permission} · {invitation.status}
                  </span>
                  {invitation.status === "PENDING" && (
                    <button
                      type="button"
                      disabled={invitationBusy}
                      onClick={() => void revoke(invitation.id)}
                      className="font-bold text-red-700 underline disabled:opacity-50"
                    >
                      {invitationBusy ? "Đang thu hồi…" : "Thu hồi"}
                    </button>
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
