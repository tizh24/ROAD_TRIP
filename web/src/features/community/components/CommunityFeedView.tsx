"use client";
import { toast } from "@/components/ui/sonner";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bookmark, Compass, Flag, Heart, MapPin, MessageCircle, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  createCommunityPost,
  createPostComment,
  fetchCommunityPosts,
  fetchPostComments,
  submitReport,
  togglePostLike,
  togglePostSave,
  type CommunityComment,
  type CommunityPost,
} from "../api/community";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CommunityFeedView() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  // Filter
  const [activeTab, setActiveTab] = useState<"ALL" | "WITH_TRIP">("ALL");

  // Create post modal state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newTripId, setNewTripId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Active comments drawer
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Report modal state
  const [reportingTarget, setReportingTarget] = useState<{ id: string; type: "POST" | "COMMENT" } | null>(null);
  const [reportReason, setReportReason] = useState("SPAM");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await fetchCommunityPosts();
      setPosts([...data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách bài viết.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadPosts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadPosts]);

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await togglePostLike(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            hasLiked: res.liked,
            likeCount: res.liked ? p.likeCount + 1 : Math.max(p.likeCount - 1, 0),
          };
        }),
      );
    } catch {
      toast.error("Vui lòng đăng nhập để thích bài viết.");
    }
  };

  const handleToggleSave = async (postId: string) => {
    try {
      const res = await togglePostSave(postId);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          return {
            ...p,
            hasSaved: res.saved,
            saveCount: res.saved ? p.saveCount + 1 : Math.max(p.saveCount - 1, 0),
          };
        }),
      );
    } catch {
      toast.error("Vui lòng đăng nhập để lưu bài viết.");
    }
  };

  const handleOpenComments = async (postId: string) => {
    if (activeCommentsPostId === postId) {
      setActiveCommentsPostId(null);
      return;
    }
    setActiveCommentsPostId(postId);
    setLoadingComments(true);
    try {
      const list = await fetchPostComments(postId);
      setComments([...list]);
    } catch {
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentsPostId || !commentInput.trim()) return;
    try {
      setSubmittingComment(true);
      const newComment = await createPostComment(activeCommentsPostId, commentInput.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentInput("");
      setPosts((prev) =>
        prev.map((p) =>
          p.id === activeCommentsPostId ? { ...p, commentCount: p.commentCount + 1 } : p,
        ),
      );
    } catch {
      toast.error("Không thể gửi bình luận. Vui lòng đăng nhập.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    try {
      setSubmitting(true);
      const mediaUrls = newMediaUrl.trim() ? [newMediaUrl.trim()] : [];
      const created = await createCommunityPost({
        title: newTitle.trim(),
        content: newContent.trim(),
        locationName: newLocation.trim() || undefined,
        tripId: newTripId.trim() || undefined,
        mediaUrls,
      });
      setPosts((prev) => [created, ...prev]);
      setIsComposerOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewLocation("");
      setNewMediaUrl("");
      setNewTripId("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Không thể đăng bài viết.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingTarget) return;
    try {
      setSubmittingReport(true);
      await submitReport({
        targetType: reportingTarget.type,
        targetId: reportingTarget.id,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportingTarget(null);
        setReportSuccess(false);
        setReportDetails("");
      }, 1500);
    } catch {
      toast.error("Không thể gửi báo cáo vi phạm.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "WITH_TRIP") return Boolean(p.tripId);
    return true;
  });

  const tabs = [
    { id: "ALL", label: `Tất cả bài viết (${posts.length})` },
    { id: "WITH_TRIP", label: "Kèm lộ trình chuyến đi" },
  ] as const;

  return (
    <div className="page-shell max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">Khoảnh khắc & kinh nghiệm</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Khám phá cảm hứng du lịch, những cung đường thực tế và nhật ký của các phượt thủ.
          </p>
        </div>
        <Button type="button" className="min-h-11 self-start sm:self-auto" onClick={() => setIsComposerOpen(true)}>
          <Plus aria-hidden="true" />
          Chia sẻ trải nghiệm
        </Button>
      </header>

      <div role="group" aria-label="Lọc bài viết" className="mt-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant={activeTab === tab.id ? "default" : "outline"}
            aria-pressed={activeTab === tab.id}
            className="min-h-11"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="mt-8 grid gap-1" aria-busy="true" aria-label="Đang tải bảng tin cộng đồng">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-xl bg-muted p-6">
          <p role="alert" className="text-sm text-destructive">{error}</p>
          <Button type="button" onClick={loadPosts} className="mt-4 min-h-11">
            Thử lại
          </Button>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="mt-8 flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <h2 className="text-xl font-medium">Chưa có bài viết nào</h2>
          <p className="mt-1 text-sm text-muted-foreground">Hãy là người đầu tiên chia sẻ câu chuyện hành trình hoặc kỷ niệm của bạn!</p>
          <Button type="button" onClick={() => setIsComposerOpen(true)} className="mt-5 min-h-11">
            <Plus aria-hidden="true" /> Viết bài ngay
          </Button>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border">
          {filteredPosts.map((post) => (
            <article key={post.id} className="py-8 first:pt-0">
              <div className="flex items-start justify-between gap-3">
                <Link href={`/profile/${post.authorId}`} className="focus-ring flex min-w-0 items-center gap-3 rounded">
                  {post.authorAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element -- community avatars are user-supplied URLs with no fixed host allowlist.
                    <img src={post.authorAvatar} alt={post.authorName} className="size-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-10 items-center justify-center rounded-full bg-muted font-medium" aria-hidden="true">
                      {post.authorName.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{post.authorName}</span>
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="tabular-nums">{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                      {post.locationName && (
                        <span className="flex items-center gap-0.5">
                          · <MapPin className="size-3.5" aria-hidden="true" />
                          {post.locationName}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
                <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0" title="Báo cáo vi phạm" aria-label="Báo cáo vi phạm" onClick={() => setReportingTarget({ id: post.id, type: "POST" })}>
                  <Flag aria-hidden="true" />
                </Button>
              </div>

              {post.tripId && (
                <Link href={`/road/${post.tripId}`} className="focus-ring mt-4 inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium underline underline-offset-4">
                  <Compass className="size-4" aria-hidden="true" />
                  Xem lộ trình: {post.tripTitle || "Chuyến đi gắn kèm"}
                </Link>
              )}

              <h2 className="mt-3 text-2xl font-medium tracking-tight">{post.title}</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{post.content}</p>

              {post.mediaUrls.length > 0 && (
                <div className={`mt-4 grid gap-1 overflow-hidden rounded-lg ${post.mediaUrls.length === 1 ? "grid-cols-1" : post.mediaUrls.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {post.mediaUrls.map((url, index) => (
                    // eslint-disable-next-line @next/next/no-img-element -- post media is user-supplied and can use approved storage hosts added at runtime.
                    <img key={index} src={url} alt={`${post.title} ảnh ${index + 1}`} className="h-64 w-full object-cover" loading="lazy" />
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1">
                  <Button type="button" variant="ghost" className="min-h-11" aria-pressed={post.hasLiked} onClick={() => handleToggleLike(post.id)}>
                    <Heart className={post.hasLiked ? "fill-current" : ""} aria-hidden="true" />
                    <span className="tabular-nums">{post.likeCount}</span> Thích
                  </Button>
                  <Button type="button" variant="ghost" className="min-h-11" aria-expanded={activeCommentsPostId === post.id} onClick={() => handleOpenComments(post.id)}>
                    <MessageCircle aria-hidden="true" />
                    <span className="tabular-nums">{post.commentCount}</span> Bình luận
                  </Button>
                </div>
                <Button type="button" variant="ghost" className="min-h-11" aria-pressed={post.hasSaved} onClick={() => handleToggleSave(post.id)}>
                  <Bookmark className={post.hasSaved ? "fill-current" : ""} aria-hidden="true" />
                  {post.hasSaved ? "Đã lưu" : "Lưu"}
                </Button>
              </div>

              {activeCommentsPostId === post.id && (
                <div className="mt-4 rounded-xl bg-muted p-4 sm:p-5">
                  <div className="space-y-4">
                    {loadingComments ? (
                      <p className="text-sm text-muted-foreground">Đang tải bình luận...</p>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!</p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="flex items-start gap-3 text-sm">
                          {c.authorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element -- comment avatars are user-supplied URLs with no fixed host allowlist.
                            <img src={c.authorAvatar} alt={c.authorName} className="size-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex size-8 items-center justify-center rounded-full bg-card font-medium" aria-hidden="true">
                              {c.authorName.slice(0, 1).toUpperCase()}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="flex items-baseline justify-between gap-2">
                              <span className="font-medium">{c.authorName}</span>
                              <span className="text-xs tabular-nums text-muted-foreground">
                                {new Date(c.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </p>
                            <p className="mt-0.5 leading-relaxed text-muted-foreground">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddComment} className="mt-5 flex gap-2">
                    <Input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder="Viết bình luận chân thành..."
                      aria-label="Viết bình luận"
                      className="h-11 flex-1 bg-card"
                    />
                    <Button type="submit" disabled={submittingComment || !commentInput.trim()} className="min-h-11">
                      <Send aria-hidden="true" />
                      Gửi
                    </Button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!isComposerOpen} onOpenChange={(open) => { if (!open) setIsComposerOpen(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chia sẻ trải nghiệm hành trình</DialogTitle>
            <DialogDescription className="sr-only">Biểu mẫu trong hộp thoại</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePost} className="mt-2 space-y-4">
            <div>
              <label htmlFor="cf-title" className="block text-sm font-medium">Tiêu đề bài viết *</label>
              <Input id="cf-title" type="text" required placeholder="Ví dụ: 3 ngày 2 đêm săn mây Tà Xùa tuyệt đẹp..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-2 h-11" />
            </div>
            <div>
              <label htmlFor="cf-content" className="block text-sm font-medium">Nội dung chia sẻ *</label>
              <Textarea id="cf-content" required rows={4} placeholder="Chia sẻ kinh nghiệm, lưu ý đường xá, quán ăn ngon..." value={newContent} onChange={(e) => setNewContent(e.target.value)} className="mt-2 min-h-28" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="cf-location" className="block text-sm font-medium">Địa điểm check-in</label>
                <Input id="cf-location" type="text" placeholder="Ví dụ: Tà Xùa, Sơn La" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="mt-2 h-11" />
              </div>
              <div>
                <label htmlFor="cf-media" className="block text-sm font-medium">URL ảnh đính kèm</label>
                <Input id="cf-media" type="url" placeholder="https://images.unsplash.com/..." value={newMediaUrl} onChange={(e) => setNewMediaUrl(e.target.value)} className="mt-2 h-11" />
              </div>
            </div>
            <div>
              <label htmlFor="cf-trip" className="block text-sm font-medium">ID chuyến đi đính kèm (nếu có)</label>
              <Input id="cf-trip" type="text" placeholder="UUID chuyến đi của bạn để mọi người có thể xem lộ trình" value={newTripId} onChange={(e) => setNewTripId(e.target.value)} className="mt-2 h-11" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setIsComposerOpen(false)}>
                Hủy bỏ
              </Button>
              <Button type="submit" className="min-h-11" disabled={submitting || !newTitle.trim() || !newContent.trim()}>
                {submitting ? "Đang đăng..." : "Đăng bài viết"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!reportingTarget} onOpenChange={(open) => { if (!open) setReportingTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Báo cáo nội dung vi phạm</DialogTitle>
            <DialogDescription className="sr-only">Biểu mẫu trong hộp thoại</DialogDescription>
          </DialogHeader>

          {reportSuccess ? (
            <div role="status" className="py-8 text-center">
              <p className="font-medium text-success">Cảm ơn bạn đã phản hồi!</p>
              <p className="mt-1 text-sm text-muted-foreground">Đội ngũ kiểm duyệt Tripz sẽ xem xét báo cáo này sớm nhất.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReport} className="mt-2 space-y-4">
              <div>
                <label htmlFor="cf-reason" className="block text-sm font-medium">Lý do báo cáo</label>
                <select id="cf-reason" value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="field mt-2 min-h-11 w-full bg-card">
                  <option value="SPAM">Tin rác / Quảng cáo trái phép</option>
                  <option value="INAPPROPRIATE">Nội dung phản cảm / Đồi trụy</option>
                  <option value="HARASSMENT">Quấy rối / Xúc phạm người khác</option>
                  <option value="OTHER">Lý do khác</option>
                </select>
              </div>
              <div>
                <label htmlFor="cf-details" className="block text-sm font-medium">Chi tiết thêm (tuỳ chọn)</label>
                <Textarea id="cf-details" rows={3} placeholder="Mô tả cụ thể hành vi vi phạm..." value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} className="mt-2 min-h-24" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" className="min-h-11" onClick={() => setReportingTarget(null)}>
                  Đóng
                </Button>
                <Button type="submit" variant="destructive" className="min-h-11" disabled={submittingReport}>
                  {submittingReport ? "Đang gửi..." : "Gửi báo cáo"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
