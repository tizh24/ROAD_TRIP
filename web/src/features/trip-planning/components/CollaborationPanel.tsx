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
import {
  COLLAB_PAGE_SIZE,
  countInvitations,
  countMembers,
  memberLabel,
  selectInvitations,
  selectMembers,
  type InvitationFilter,
  type MemberFilter,
} from "../api/collaboration-model";
import { trackAnalytics } from "@/lib/analytics/analytics";
import FeedbackState from "@/components/ui/FeedbackState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

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
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("ALL");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberPage, setMemberPage] = useState({ key: "", size: COLLAB_PAGE_SIZE });
  const [memberToRemove, setMemberToRemove] = useState<Member>();
  const [invitationFilter, setInvitationFilter] = useState<InvitationFilter>("PENDING");
  const [invitationQuery, setInvitationQuery] = useState("");
  const [invitationPage, setInvitationPage] = useState({ key: "", size: COLLAB_PAGE_SIZE });

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

  const memberPageKey = `${memberFilter}|${memberQuery}`;
  const memberSize = memberPage.key === memberPageKey ? memberPage.size : COLLAB_PAGE_SIZE;
  const memberRows = selectMembers(members, { filter: memberFilter, query: memberQuery });
  const visibleMembers = memberRows.slice(0, memberSize);

  const invitationPageKey = `${invitationFilter}|${invitationQuery}`;
  const invitationSize = invitationPage.key === invitationPageKey ? invitationPage.size : COLLAB_PAGE_SIZE;
  const invitationRows = selectInvitations(invitations, { filter: invitationFilter, query: invitationQuery });
  const visibleInvitations = invitationRows.slice(0, invitationSize);

  const memberFilters: { id: MemberFilter; label: string }[] = [
    { id: "ALL", label: "Tất cả" },
    { id: "EDIT", label: "Có thể sửa" },
    { id: "VIEW", label: "Chỉ xem" },
  ];
  const invitationFilters: { id: InvitationFilter; label: string }[] = [
    { id: "PENDING", label: "Đang chờ" },
    { id: "ALL", label: "Tất cả" },
  ];

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

      <div className="mt-8">
        <h3 className="text-lg font-medium">
          Thành viên
          <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">{memberRows.length}</span>
        </h3>
        <ListControls
          searchLabel="Tìm thành viên"
          query={memberQuery}
          onQuery={setMemberQuery}
          filterLabel="Lọc thành viên theo quyền"
          filters={memberFilters.map((item) => ({ ...item, count: countMembers(members, item.id) }))}
          active={memberFilter}
          onFilter={(id) => setMemberFilter(id as MemberFilter)}
        />
        {loading ? (
          <p className="mt-4 text-sm text-muted-foreground">Đang tải thành viên…</p>
        ) : memberRows.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Không có thành viên phù hợp.</p>
        ) : (
          <ul className="mt-3 grid gap-1" aria-label="Thành viên chuyến đi">
            {visibleMembers.map((member, index) => {
              const memberBusy = pendingAction === `member:${member.userId}`;
              const label = memberLabel(member);
              return (
                <li
                  key={member.userId}
                  className={`flex min-h-14 flex-wrap items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}
                >
                  <strong className="min-w-0 font-medium">{label}</strong>
                  {member.role === "MEMBER" && (
                    <span className="flex gap-2">
                      <select
                        aria-label={`Quyền của ${label}`}
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
                        aria-label={`Gỡ ${label}`}
                        onClick={() => setMemberToRemove(member)}
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
        <LoadMore shown={visibleMembers.length} total={memberRows.length} noun="thành viên" onMore={() => setMemberPage({ key: memberPageKey, size: memberSize + COLLAB_PAGE_SIZE })} />
      </div>

      {invitations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium">
            Lời mời
            <span className="ml-2 text-sm font-normal tabular-nums text-muted-foreground">{invitationRows.length}</span>
          </h3>
          <ListControls
            searchLabel="Tìm lời mời theo email"
            query={invitationQuery}
            onQuery={setInvitationQuery}
            filterLabel="Lọc lời mời theo trạng thái"
            filters={invitationFilters.map((item) => ({ ...item, count: countInvitations(invitations, item.id) }))}
            active={invitationFilter}
            onFilter={(id) => setInvitationFilter(id as InvitationFilter)}
          />
          {invitationRows.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Không có lời mời phù hợp.</p>
          ) : (
            <ul className="mt-2 divide-y divide-border">
              {visibleInvitations.map((invitation) => {
                const invitationBusy = pendingAction === `invitation:${invitation.id}`;
                return (
                  <li key={invitation.id} className="flex min-h-12 flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="min-w-0 break-all">
                      {invitation.inviteeEmail} · {invitation.permission === "EDIT" ? "Có thể sửa" : "Chỉ xem"} · {invitationStatusLabels[invitation.status]}
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
          )}
          <LoadMore shown={visibleInvitations.length} total={invitationRows.length} noun="lời mời" onMore={() => setInvitationPage({ key: invitationPageKey, size: invitationSize + COLLAB_PAGE_SIZE })} />
        </div>
      )}

      <ConfirmDialog
        open={memberToRemove !== undefined}
        title="Gỡ thành viên khỏi chuyến đi?"
        description={memberToRemove ? `${memberLabel(memberToRemove)} sẽ không còn truy cập được chuyến đi này. Bạn có thể mời lại sau.` : ""}
        confirmLabel="Gỡ thành viên"
        busy={memberToRemove !== undefined && pendingAction === `member:${memberToRemove.userId}`}
        onClose={() => setMemberToRemove(undefined)}
        onConfirm={() => {
          const target = memberToRemove;
          if (!target) return;
          void remove(target.userId).finally(() => setMemberToRemove(undefined));
        }}
      />
    </section>
  );
}

const invitationStatusLabels: Record<Invitation["status"], string> = {
  PENDING: "Đang chờ",
  ACCEPTED: "Đã nhận",
  DECLINED: "Đã từ chối",
  EXPIRED: "Hết hạn",
  REVOKED: "Đã thu hồi",
};

function ListControls({
  searchLabel,
  query,
  onQuery,
  filterLabel,
  filters,
  active,
  onFilter,
}: {
  searchLabel: string;
  query: string;
  onQuery: (value: string) => void;
  filterLabel: string;
  filters: { id: string; label: string; count: number }[];
  active: string;
  onFilter: (id: string) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div role="group" aria-label={filterLabel} className="flex flex-wrap gap-2">
        {filters.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={active === item.id ? "default" : "outline"}
            aria-pressed={active === item.id}
            className="min-h-9"
            onClick={() => onFilter(item.id)}
          >
            {item.label}
            <span className="tabular-nums opacity-70">{item.count}</span>
          </Button>
        ))}
      </div>
      <Input
        type="search"
        aria-label={searchLabel}
        placeholder={searchLabel}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        className="h-11 sm:w-64"
      />
    </div>
  );
}

function LoadMore({ shown, total, noun, onMore }: { shown: number; total: number; noun: string; onMore: () => void }) {
  if (total <= shown) return null;
  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <p className="text-sm tabular-nums text-muted-foreground" role="status">
        Đang hiển thị {shown} / {total} {noun}
      </p>
      <Button type="button" variant="outline" className="min-h-11" onClick={onMore}>
        Xem thêm
      </Button>
    </div>
  );
}

function message(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}
