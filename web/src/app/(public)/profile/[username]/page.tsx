"use client";
import { toast } from "@/components/ui/sonner";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { UserCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
      <div className="page-shell max-w-4xl px-4 py-10 sm:px-6" aria-busy="true" aria-label="Đang tải">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="mt-6 h-9 w-64" />
        <Skeleton className="mt-8 h-32 rounded-lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-shell max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-medium">Không thể tải thông tin</h2>
        <p role="alert" className="mt-2 text-sm text-muted-foreground">{error || "Hồ sơ không tồn tại."}</p>
        <Button asChild className="mt-6 min-h-11">
          <Link href="/feed">Quay lại bảng tin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="page-shell max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- profile avatars are user-supplied URLs with no fixed host allowlist.
          <img src={profile.avatarUrl} alt={profile.fullName} className="size-24 rounded-full object-cover" />
        ) : (
          <span className="flex size-24 items-center justify-center rounded-full bg-muted text-3xl font-medium" aria-hidden="true">
            {profile.fullName.slice(0, 1).toUpperCase()}
          </span>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-medium tracking-tight">{profile.fullName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Thành viên cộng đồng phượt Tripz</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dd className="order-first text-xl font-medium tabular-nums">{profile.followerCount}</dd>
              <dt className="text-muted-foreground">Người theo dõi</dt>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dd className="order-first text-xl font-medium tabular-nums">{profile.followingCount}</dd>
              <dt className="text-muted-foreground">Đang theo dõi</dt>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dd className="order-first text-xl font-medium tabular-nums">{profile.publicTrips.length}</dd>
              <dt className="text-muted-foreground">Chuyến đi công khai</dt>
            </div>
          </dl>
        </div>

        <Button type="button" variant={following ? "outline" : "default"} aria-pressed={following} className="min-h-11 self-start sm:self-auto" onClick={handleToggleFollow} disabled={updatingFollow}>
          {following ? <UserCheck aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
          {following ? "Đang theo dõi" : "Theo dõi"}
        </Button>
      </header>

      <section className="mt-14" aria-labelledby="shared-trips">
        <h2 id="shared-trips" className="text-2xl font-medium tracking-tight">Hành trình đã chia sẻ</h2>
        <p className="mt-1 text-sm text-muted-foreground">Các chuyến đi được công khai để mọi người có thể tham khảo hoặc sao chép.</p>

        {profile.publicTrips.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <p className="text-base font-medium">Chưa có hành trình công khai nào</p>
            <p className="mt-1 text-sm text-muted-foreground">Người dùng này chưa chia sẻ chuyến đi công khai nào lên cộng đồng.</p>
          </div>
        ) : (
          <ul className="mt-6 grid gap-1">
            {profile.publicTrips.map((trip, index) => (
              <li key={trip.id} className={`rounded-lg ${index % 2 === 0 ? "bg-muted" : "bg-muted/50"}`}>
                <Link href={`/road/${trip.id}`} className="focus-ring grid gap-x-8 gap-y-1 rounded-lg px-5 py-4 transition-colors hover:bg-border/60 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <span className="min-w-0">
                    <span className="block truncate text-lg font-medium">{trip.title}</span>
                    <span className="block text-sm tabular-nums text-muted-foreground">
                      {new Date(trip.startDate).toLocaleDateString("vi-VN")} - {new Date(trip.endDate).toLocaleDateString("vi-VN")}
                      {trip.budgetAmount > 0 && <> · Dự trù: {new Intl.NumberFormat("vi-VN").format(trip.budgetAmount)} {trip.currency}</>}
                    </span>
                  </span>
                  <span className="text-sm font-medium">Xem chi tiết lộ trình</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
