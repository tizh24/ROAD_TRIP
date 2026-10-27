"use client";
import { toast } from "@/components/ui/sonner";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import {
  Calendar,
  Compass,
  UserCheck,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  fetchUserProfile,
  toggleUserFollow,
  type UserProfile,
} from "@/features/community/api/community";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const targetUserId = resolvedParams.username;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [following, setFollowing] = useState(false);
  const [updatingFollow, setUpdatingFollow] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await fetchUserProfile(targetUserId);
      setProfile(data);
      setFollowing(data.isFollowing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tìm thấy hồ sơ người dùng.");
    } finally {
      setLoading(false);
    }
  }, [targetUserId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProfile(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProfile]);

  const handleToggleFollow = async () => {
    if (!profile) return;
    try {
      setUpdatingFollow(true);
      const res = await toggleUserFollow(targetUserId);
      setFollowing(res.following);
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              followerCount: res.following ? prev.followerCount + 1 : Math.max(prev.followerCount - 1, 0),
            }
          : null,
      );
    } catch {
      toast.error("Vui lòng đăng nhập để theo dõi người dùng này.");
    } finally {
      setUpdatingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-muted">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-muted px-4 py-12 text-center">
        <div className="mx-auto max-w-md rounded-2xl bg-card p-8 shadow-sm">
          <h2 className="text-xl font-bold text-red-600">Không thể tải thông tin</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error || "Hồ sơ không tồn tại."}</p>
          <Link
            href="/feed"
            className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90"
          >
            Quay lại bảng tin
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-8 text-foreground sm:px-6 sm:py-12">
      <div className="page-shell max-w-4xl px-0">
        <section className="overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- profile avatars are user-supplied URLs with no fixed host allowlist.
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-black text-primary">
                {profile.fullName.slice(0, 1).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl font-black text-foreground sm:text-3xl">{profile.fullName}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Thành viên cộng đồng phượt Tripz</p>
              <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm sm:justify-start">
                <div><span className="font-extrabold text-foreground">{profile.followerCount}</span> <span className="text-muted-foreground">Người theo dõi</span></div>
                <div><span className="font-extrabold text-foreground">{profile.followingCount}</span> <span className="text-muted-foreground">Đang theo dõi</span></div>
                <div><span className="font-extrabold text-foreground">{profile.publicTrips.length}</span> <span className="text-muted-foreground">Chuyến đi công khai</span></div>
              </div>
            </div>

            <button
              onClick={handleToggleFollow}
              disabled={updatingFollow}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition active:scale-95 disabled:opacity-50 ${following ? "border border-border bg-gray-100 text-foreground hover:bg-gray-200" : "bg-primary text-white hover:bg-primary/90"}`}
            >
              {following ? <><UserCheck size={16} /> Đang theo dõi</> : <><UserPlus size={16} /> Theo dõi</>}
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div>
            <h2 className="text-xl font-black text-foreground sm:text-2xl">Hành trình đã chia sẻ</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Các chuyến đi được công khai để mọi người có thể tham khảo hoặc sao chép.</p>
          </div>

          {profile.publicTrips.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
              <Compass className="mx-auto text-primary" size={36} />
              <p className="mt-3 text-sm font-bold text-foreground">Chưa có hành trình công khai nào</p>
              <p className="mt-1 text-xs text-muted-foreground">Người dùng này chưa chia sẻ chuyến đi công khai nào lên cộng đồng.</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {profile.publicTrips.map((trip) => (
                <div key={trip.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md">
                  <div>
                    <h3 className="text-base font-bold text-foreground">{trip.title}</h3>
                    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Calendar size={14} className="text-primary" /><span>{new Date(trip.startDate).toLocaleDateString("vi-VN")} - {new Date(trip.endDate).toLocaleDateString("vi-VN")}</span></div>
                    {trip.budgetAmount > 0 && <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Wallet size={14} className="text-emerald-600" /><span>Dự trù: {new Intl.NumberFormat("vi-VN").format(trip.budgetAmount)} {trip.currency}</span></div>}
                  </div>
                  <div className="mt-5 border-t border-border pt-3">
                    <Link href={`/road/${trip.id}`} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground transition hover:bg-primary hover:text-white"><Compass size={14} /> Xem chi tiết lộ trình</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
