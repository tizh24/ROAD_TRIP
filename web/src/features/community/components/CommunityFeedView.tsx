"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  Compass,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
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
      alert("Vui lòng đăng nhập để thích bài viết.");
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
      alert("Vui lòng đăng nhập để lưu bài viết.");
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
      alert("Không thể gửi bình luận. Vui lòng đăng nhập.");
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
      alert(err instanceof Error ? err.message : "Không thể đăng bài viết.");
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
      alert("Không thể gửi báo cáo vi phạm.");
    } finally {
      setSubmittingReport(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "WITH_TRIP") return Boolean(p.tripId);
    return true;
  });

  return (
    <main className="min-h-screen bg-background-warm px-4 py-8 text-text-main sm:px-6 sm:py-12">
      <div className="page-shell max-w-4xl px-0">
        {/* Hero Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <UsersRound size={18} />
              <span>CỘNG ĐỒNG XÊ DỊCH TRIPZ</span>
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-text-main sm:text-3xl">
              Khoảnh Khắc & Kinh Nghiệm
            </h1>
            <p className="mt-1 text-sm text-text-sub">
              Khám phá cảm hứng du lịch, những cung đường thực tế và nhật ký của các phượt thủ.
            </p>
          </div>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-95"
          >
            <Plus size={18} />
            Chia sẻ trải nghiệm
          </button>
        </div>

        {/* Tab Filters */}
        <div className="mt-6 flex border-b border-border-main">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "ALL"
                ? "border-primary text-primary"
                : "border-transparent text-text-sub hover:text-text-main"
            }`}
          >
            Tất cả bài viết ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab("WITH_TRIP")}
            className={`border-b-2 px-4 py-2.5 text-sm font-bold transition ${
              activeTab === "WITH_TRIP"
                ? "border-primary text-primary"
                : "border-transparent text-text-sub hover:text-text-main"
            }`}
          >
            Kèm lộ trình chuyến đi
          </button>
        </div>

        {/* Feed List */}
        {loading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-center text-text-sub">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-sm font-semibold">Đang tải bảng tin cộng đồng...</p>
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-700">
            <p className="font-semibold">{error}</p>
            <button
              onClick={loadPosts}
              className="mt-3 rounded-lg bg-red-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-border-main bg-white p-12 text-center">
            <Sparkles className="mx-auto text-primary" size={36} />
            <h3 className="mt-3 text-lg font-bold text-text-main">Chưa có bài viết nào</h3>
            <p className="mt-1 text-sm text-text-sub">
              Hãy là người đầu tiên chia sẻ câu chuyện hành trình hoặc kỷ niệm của bạn!
            </p>
            <button
              onClick={() => setIsComposerOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover"
            >
              <Plus size={16} /> Viết bài ngay
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-2xl border border-border-main bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between p-5 pb-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/profile/${post.authorId}`}
                      className="group flex items-center gap-3"
                    >
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                          {post.authorName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-text-main group-hover:text-primary transition">
                          {post.authorName}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-sub">
                          <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                          {post.locationName && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-primary">
                                <MapPin size={12} />
                                {post.locationName}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReportingTarget({ id: post.id, type: "POST" })}
                      title="Báo cáo vi phạm"
                      className="rounded-lg p-2 text-text-sub hover:bg-gray-100 hover:text-red-600 transition"
                    >
                      <Flag size={16} />
                    </button>
                  </div>
                </div>

                {/* Post Trip Association */}
                {post.tripId && (
                  <div className="mx-5 mb-3">
                    <Link
                      href={`/road/${post.tripId}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                      <Compass size={14} />
                      <span>Xem lộ trình: {post.tripTitle || "Chuyến đi gắn kèm"}</span>
                    </Link>
                  </div>
                )}

                {/* Post Content */}
                <div className="px-5 py-2">
                  <h2 className="text-lg font-bold text-text-main">{post.title}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-text-sub">
                    {post.content}
                  </p>
                </div>

                {/* Media Gallery */}
                {post.mediaUrls.length > 0 && (
                  <div className="mt-3 px-5">
                    <div
                      className={`grid gap-2 rounded-xl overflow-hidden ${
                        post.mediaUrls.length === 1
                          ? "grid-cols-1"
                          : post.mediaUrls.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-3"
                      }`}
                    >
                      {post.mediaUrls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`${post.title} ảnh ${index + 1}`}
                          className="h-64 w-full object-cover transition hover:scale-105"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Post Actions Bar */}
                <div className="mt-4 flex items-center justify-between border-t border-border-main px-5 py-3 text-xs font-semibold text-text-sub">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                        post.hasLiked
                          ? "text-red-600 bg-red-50"
                          : "hover:bg-gray-100 hover:text-red-600"
                      }`}
                    >
                      <Heart
                        size={16}
                        className={post.hasLiked ? "fill-red-600" : ""}
                      />
                      <span>{post.likeCount} Thích</span>
                    </button>

                    <button
                      onClick={() => handleOpenComments(post.id)}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                        activeCommentsPostId === post.id
                          ? "text-primary bg-primary/10"
                          : "hover:bg-gray-100 hover:text-primary"
                      }`}
                    >
                      <MessageCircle size={16} />
                      <span>{post.commentCount} Bình luận</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleSave(post.id)}
                    className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition ${
                      post.hasSaved
                        ? "text-primary bg-primary/10"
                        : "hover:bg-gray-100 hover:text-primary"
                    }`}
                  >
                    <Bookmark
                      size={16}
                      className={post.hasSaved ? "fill-primary" : ""}
                    />
                    <span>{post.hasSaved ? "Đã lưu" : "Lưu"}</span>
                  </button>
                </div>

                {/* Comments Section Drawer */}
                {activeCommentsPostId === post.id && (
                  <div className="border-t border-border-main bg-background-warm/60 p-5">
                    <div className="space-y-3">
                      {loadingComments ? (
                        <p className="text-center text-xs text-text-sub">Đang tải bình luận...</p>
                      ) : comments.length === 0 ? (
                        <p className="text-center text-xs text-text-sub italic">
                          Chưa có bình luận nào. Hãy là người đầu tiên để lại ý kiến!
                        </p>
                      ) : (
                        comments.map((c) => (
                          <div key={c.id} className="flex items-start gap-2.5 text-xs">
                            {c.authorAvatar ? (
                              <img
                                src={c.authorAvatar}
                                alt={c.authorName}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                {c.authorName.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 rounded-xl bg-white p-3 shadow-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-text-main">{c.authorName}</span>
                                <span className="text-[10px] text-text-sub">
                                  {new Date(c.createdAt).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="mt-1 text-text-sub leading-normal">{c.content}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Comment Input */}
                    <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Viết bình luận chân thành..."
                        className="flex-1 rounded-xl border border-border-main bg-white px-3.5 py-2 text-xs text-text-main outline-none focus:border-primary"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentInput.trim()}
                        className="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                      >
                        <Send size={13} />
                        Gửi
                      </button>
                    </form>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h3 className="text-lg font-bold text-text-main">Chia sẻ trải nghiệm hành trình</h3>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="rounded-lg p-1.5 text-text-sub hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 3 ngày 2 đêm săn mây Tà Xùa tuyệt đẹp..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main">Nội dung chia sẻ *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Chia sẻ kinh nghiệm, lưu ý đường xá, quán ăn ngon..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-text-main">Địa điểm check-in</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Tà Xùa, Sơn La"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main">URL ảnh đính kèm</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newMediaUrl}
                    onChange={(e) => setNewMediaUrl(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main">
                  ID Chuyến đi đính kèm (nếu có)
                </label>
                <input
                  type="text"
                  placeholder="UUID chuyến đi của bạn để mọi người có thể xem lộ trình"
                  value={newTripId}
                  onChange={(e) => setNewTripId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="rounded-xl border border-border-main px-4 py-2 text-sm font-semibold text-text-sub hover:bg-gray-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newTitle.trim() || !newContent.trim()}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {submitting ? "Đang đăng..." : "Đăng bài viết"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border-main pb-4">
              <h3 className="text-base font-bold text-text-main">Báo cáo nội dung vi phạm</h3>
              <button
                onClick={() => setReportingTarget(null)}
                className="rounded-lg p-1.5 text-text-sub hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-8 text-center text-emerald-600">
                <p className="font-bold">Cảm ơn bạn đã phản hồi!</p>
                <p className="mt-1 text-xs text-text-sub">
                  Đội ngũ kiểm duyệt Tripz sẽ xem xét báo cáo này sớm nhất.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text-main">Lý do báo cáo</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="SPAM">Tin rác / Quảng cáo trái phép</option>
                    <option value="INAPPROPRIATE">Nội dung phản cảm / Đồi trụy</option>
                    <option value="HARASSMENT">Quấy rối / Xúc phạm người khác</option>
                    <option value="OTHER">Lý do khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main">Chi tiết thêm (tuỳ chọn)</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả cụ thể hành vi vi phạm..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border-main px-3.5 py-2 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportingTarget(null)}
                    className="rounded-xl border border-border-main px-4 py-2 text-xs font-semibold text-text-sub hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {submittingReport ? "Đang gửi..." : "Gửi báo cáo"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
