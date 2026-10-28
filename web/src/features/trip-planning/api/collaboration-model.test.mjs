import assert from "node:assert/strict";
import test from "node:test";
import {
  COLLAB_PAGE_SIZE,
  countInvitations,
  countMembers,
  memberLabel,
  selectInvitations,
  selectMembers,
} from "./collaboration-model.ts";

const uid = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const member = (n, permission = "VIEW", role = "MEMBER", status = "ACTIVE") => ({ userId: uid(n), role, permission, status });
const invitation = (n, status = "PENDING", minute = n) => ({
  id: uid(n),
  tripId: uid(9999),
  inviteeEmail: `khach${n}@example.test`,
  permission: "VIEW",
  status,
  expiresAt: "2030-01-01T00:00:00.000Z",
  acceptedUserId: null,
  createdAt: `2026-06-01T10:${String(minute % 60).padStart(2, "0")}:00.000Z`,
});

test("members never expose a raw uuid in their label", () => {
  assert.equal(memberLabel(member(1, "EDIT", "OWNER")), "Chủ chuyến đi");
  const label = memberLabel(member(1234));
  assert.equal(label, "Thành viên 1234");
  assert.ok(!label.includes("0000-4000"));
});

test("members: owner first, editors before viewers, inactive hidden, order stable", () => {
  const list = [member(5), member(2, "EDIT"), member(1, "EDIT", "OWNER"), member(3, "VIEW", "MEMBER", "REMOVED"), member(4, "EDIT")];
  const result = selectMembers(list, { filter: "ALL", query: "" });
  assert.deepEqual(result.map((item) => item.userId), [uid(1), uid(2), uid(4), uid(5)]);
  assert.deepEqual(result.map((item) => item.userId), selectMembers([...list].reverse(), { filter: "ALL", query: "" }).map((item) => item.userId));
});

test("members: filter and search keep counts consistent on 500 rows with a bounded page", () => {
  const list = Array.from({ length: 500 }, (_, index) => member(index + 10, index % 5 === 0 ? "EDIT" : "VIEW"));
  assert.equal(countMembers(list, "ALL"), 500);
  assert.equal(countMembers(list, "EDIT"), 100);
  const editors = selectMembers(list, { filter: "EDIT", query: "" });
  assert.equal(editors.length, 100);
  assert.equal(editors.slice(0, COLLAB_PAGE_SIZE).length, COLLAB_PAGE_SIZE);
  assert.equal(selectMembers(list, { filter: "ALL", query: " thành viên 0010 " }).length, 1);
});

test("invitations: pending first then newest, filter and search by email", () => {
  const list = [invitation(1, "ACCEPTED", 50), invitation(2, "PENDING", 10), invitation(3, "PENDING", 20), invitation(4, "REVOKED", 59)];
  assert.deepEqual(selectInvitations(list, { filter: "ALL", query: "" }).map((item) => item.id), [uid(3), uid(2), uid(4), uid(1)]);
  assert.deepEqual(selectInvitations(list, { filter: "PENDING", query: "" }).map((item) => item.id), [uid(3), uid(2)]);
  assert.deepEqual(selectInvitations(list, { filter: "ALL", query: "KHACH2@" }).map((item) => item.id), [uid(2)]);
  assert.equal(countInvitations(list, "ALL"), 4);
  assert.equal(countInvitations(list, "PENDING"), 2);
});

test("invitations: 400 rows stay bounded per page and selection does not mutate input", () => {
  const list = Array.from({ length: 400 }, (_, index) => invitation(index + 1, index % 4 === 0 ? "PENDING" : "EXPIRED"));
  const before = list.map((item) => item.id);
  const pending = selectInvitations(list, { filter: "PENDING", query: "" });
  assert.equal(pending.length, 100);
  assert.equal(pending.slice(0, COLLAB_PAGE_SIZE).length, COLLAB_PAGE_SIZE);
  assert.deepEqual(list.map((item) => item.id), before);
});
