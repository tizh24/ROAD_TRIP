import type { Invitation, Member } from "./trip-model.ts";

/** Rows rendered per page in each collaboration list; grows by this much per "Xem thêm". */
export const COLLAB_PAGE_SIZE = 10;

export type MemberFilter = "ALL" | "EDIT" | "VIEW";
export type InvitationFilter = "ALL" | "PENDING";

/** The API returns no display name, so members are told apart by a short, stable id suffix. */
export function memberLabel(member: Pick<Member, "role" | "userId">): string {
  return member.role === "OWNER" ? "Chủ chuyến đi" : `Thành viên ${member.userId.slice(-4)}`;
}

const permissionRank = { EDIT: 0, VIEW: 1 } as const;

/** Active members only: owner first, then editors, then viewers; ties break on userId. */
export function selectMembers(
  members: readonly Member[],
  options: { filter: MemberFilter; query: string },
): Member[] {
  const query = options.query.trim().toLowerCase();
  return members
    .filter((member) => member.status === "ACTIVE")
    .filter((member) => options.filter === "ALL" || member.permission === options.filter)
    .filter((member) => !query || memberLabel(member).toLowerCase().includes(query))
    .sort(
      (a, b) =>
        Number(b.role === "OWNER") - Number(a.role === "OWNER") ||
        permissionRank[a.permission] - permissionRank[b.permission] ||
        a.userId.localeCompare(b.userId),
    );
}

/** Pending invitations first, then newest first; ties break on id. */
export function selectInvitations(
  invitations: readonly Invitation[],
  options: { filter: InvitationFilter; query: string },
): Invitation[] {
  const query = options.query.trim().toLowerCase();
  return invitations
    .filter((invitation) => options.filter === "ALL" || invitation.status === "PENDING")
    .filter((invitation) => !query || invitation.inviteeEmail.toLowerCase().includes(query))
    .sort(
      (a, b) =>
        Number(b.status === "PENDING") - Number(a.status === "PENDING") ||
        b.createdAt.localeCompare(a.createdAt) ||
        a.id.localeCompare(b.id),
    );
}

export function countMembers(members: readonly Member[], filter: MemberFilter): number {
  return members.filter((member) => member.status === "ACTIVE" && (filter === "ALL" || member.permission === filter)).length;
}

export function countInvitations(invitations: readonly Invitation[], filter: InvitationFilter): number {
  return filter === "ALL" ? invitations.length : invitations.filter((invitation) => invitation.status === "PENDING").length;
}
