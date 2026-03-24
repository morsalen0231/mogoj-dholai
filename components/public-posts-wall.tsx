"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Flame,
  Heart,
  LayoutGrid,
  MessageCircle,
  MessageSquareText,
  Newspaper,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  deletePostLike,
  fetchPublicFeedPosts,
  insertPostComment,
  insertPostLike,
  type PublicFeedPost,
} from "@/lib/supabase";

const sortOptions = [
  { id: "latest", label: "Latest" },
  { id: "top", label: "Top Liked" },
  { id: "discussed", label: "Most Discussed" },
] as const;

type SortMode = (typeof sortOptions)[number]["id"];

function formatDisplayDate(value: string) {
  return new Date(value).toLocaleDateString("en-US");
}

function getFriendlyFeedError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("row-level security") || normalized.includes("violates")) {
    return "like/comment চালু করতে Supabase schema SQL apply করতে হবে।";
  }

  if (normalized.includes("duplicate")) {
    return "এই post-এ like already দেওয়া আছে।";
  }

  return message;
}

export function PublicPostsWall({
  limit = 6,
  variant = "compact",
}: {
  limit?: number;
  variant?: "compact" | "immersive";
}) {
  const { user, role } = useAuth();
  const [posts, setPosts] = useState<PublicFeedPost[]>([]);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [busyLikeId, setBusyLikeId] = useState<string | null>(null);
  const [busyCommentId, setBusyCommentId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("সব");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadPosts(showLoader = true) {
    if (showLoader) {
      setLoading(true);
    }

    const { data, error: fetchError } = await fetchPublicFeedPosts(limit, user?.id);
    if (fetchError) {
      setError(getFriendlyFeedError(fetchError.message));
    } else {
      setError(null);
      setPosts(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    let active = true;

    void fetchPublicFeedPosts(limit, user?.id).then(({ data, error: fetchError }) => {
      if (!active) {
        return;
      }

      if (fetchError) {
        setError(getFriendlyFeedError(fetchError.message));
      } else {
        setError(null);
        setPosts(data ?? []);
      }

      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [limit, user?.id]);

  const categories = useMemo(
    () => ["সব", ...Array.from(new Set(posts.map((post) => post.category))).sort((a, b) => a.localeCompare(b))],
    [posts],
  );

  const stats = useMemo(() => {
    const totalLikes = posts.reduce((sum, post) => sum + post.like_count, 0);
    const totalComments = posts.reduce((sum, post) => sum + post.comment_count, 0);
    const trendingPost = [...posts].sort((left, right) => {
      const leftScore = left.like_count * 3 + left.comment_count * 2;
      const rightScore = right.like_count * 3 + right.comment_count * 2;
      return rightScore - leftScore;
    })[0];

    return {
      totalPosts: posts.length,
      totalLikes,
      totalComments,
      trendingPost,
    };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const result = posts.filter((post) => {
      const matchesCategory = selectedCategory === "সব" || post.category === selectedCategory;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        post.fact_text.toLowerCase().includes(normalizedSearch) ||
        post.author_display_name?.toLowerCase().includes(normalizedSearch) ||
        post.author_username?.toLowerCase().includes(normalizedSearch) ||
        post.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });

    return result.sort((left, right) => {
      if (sortMode === "top") {
        if (right.like_count !== left.like_count) {
          return right.like_count - left.like_count;
        }
      }

      if (sortMode === "discussed") {
        if (right.comment_count !== left.comment_count) {
          return right.comment_count - left.comment_count;
        }
      }

      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    });
  }, [posts, searchTerm, selectedCategory, sortMode]);

  async function handleLikeToggle(postId: string) {
    if (!user) {
      setError("like দিতে হলে আগে লগইন করুন।");
      return;
    }

    const currentPost = posts.find((post) => post.id === postId);
    if (!currentPost) {
      return;
    }

    setBusyLikeId(postId);
    setError(null);

    const nextLikedState = !currentPost.viewer_has_liked;
    setPosts((current) =>
      current.map((post) =>
        post.id === postId
          ? {
              ...post,
              viewer_has_liked: nextLikedState,
              like_count: Math.max(0, post.like_count + (nextLikedState ? 1 : -1)),
            }
          : post,
      ),
    );

    const result = nextLikedState
      ? await insertPostLike({ post_id: postId, profile_id: user.id })
      : await deletePostLike(postId, user.id);

    if (result.error) {
      setError(getFriendlyFeedError(result.error.message));
      await loadPosts(false);
    }

    setBusyLikeId(null);
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();

    if (!user) {
      setError("comment করতে হলে আগে লগইন করুন।");
      return;
    }

    const draft = commentDrafts[postId]?.trim();
    if (!draft) {
      setError("comment লিখে তারপর submit করুন।");
      return;
    }

    setBusyCommentId(postId);
    setError(null);

    const displayName =
      (user.user_metadata?.display_name as string | undefined) ||
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "পাঠক";

    const { error: insertError } = await insertPostComment({
      post_id: postId,
      profile_id: user.id,
      display_name: displayName,
      comment_text: draft,
    });

    if (insertError) {
      setError(getFriendlyFeedError(insertError.message));
    } else {
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
      setActiveCommentPostId(postId);
      await loadPosts(false);
    }

    setBusyCommentId(null);
  }

  const isImmersive = variant === "immersive";
  const isAdmin = role === "admin";

  const feedControls = (
    <>
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-fuchsia-200">Composer</p>
        <h3 className="mt-3 text-2xl font-black">নতুন post</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/share" className="inline-flex items-center gap-2 rounded-full bg-rose-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-rose-200">
            <Sparkles className="h-4 w-4" />
            Post Submit
          </Link>
          <Link href="/leaderboard" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10">
            <TrendingUp className="h-4 w-4" />
            Top Users
          </Link>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-200">Feed Control</p>
        <label className="mt-4 block text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search posts
          </span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="text, author, category..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-cyan-300"
          />
        </label>

        <div className="mt-4">
          <p className="text-sm text-slate-300">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  selectedCategory === category
                    ? "bg-cyan-300 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/40 hover:bg-cyan-300/10"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-slate-300">Sort</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSortMode(option.id)}
                className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                  sortMode === option.id
                    ? "bg-amber-300 text-slate-950"
                    : "border border-white/10 bg-white/5 text-slate-200 hover:border-amber-300/40 hover:bg-amber-300/10"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="glass-panel rounded-[30px] p-5 sm:rounded-[34px] sm:p-7">
      <div className={`flex ${isImmersive ? "flex-col gap-6" : "flex-col gap-3"}`}>
        <div>
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Newspaper className="h-4 w-4" />
            Public Knowledge Feed
          </p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">
            {isImmersive ? "Facebook-style public community wall" : "approve হওয়া public post"}
          </h2>
          {!isImmersive ? (
            <p className="mt-3 text-sm leading-7 text-slate-300">যত like পড়বে, post author-এর points তত বাড়বে।</p>
          ) : null}
        </div>

        {isImmersive && isAdmin ? (
          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-[28px] border border-cyan-300/15 bg-[linear-gradient(145deg,_rgba(34,211,238,0.16),_rgba(15,23,42,0.18),_rgba(15,118,110,0.14))] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-100">Live Feed Pulse</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Public Posts</p>
                  <p className="mt-2 text-3xl font-black">{stats.totalPosts}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Likes</p>
                  <p className="mt-2 text-3xl font-black">{stats.totalLikes}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Comments</p>
                  <p className="mt-2 text-3xl font-black">{stats.totalComments}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-300/15 bg-[linear-gradient(145deg,_rgba(251,191,36,0.14),_rgba(15,23,42,0.24),_rgba(249,115,22,0.12))] p-5">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amber-100">
                <Flame className="h-4 w-4" />
                Trending Right Now
              </p>
              {stats.trendingPost ? (
                <>
                  <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-200">{stats.trendingPost.fact_text}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {stats.trendingPost.like_count} likes
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {stats.trendingPost.comment_count} comments
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                      {stats.trendingPost.category}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-slate-300">Approved post আসলে trending card auto-fill হবে।</p>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className={`mt-5 ${isImmersive ? "grid gap-4 xl:grid-cols-[0.78fr_1.22fr]" : "space-y-4"}`}>
        {isImmersive ? (
          <details className="order-1 xl:hidden">
            <summary className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-100">
              <SlidersHorizontal className="h-4 w-4" />
              feed options
            </summary>
            <div className="mt-4 space-y-4">
              {feedControls}
            </div>
          </details>
        ) : null}

        {isImmersive ? null : (
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="block text-sm text-slate-300">
                <span className="inline-flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </span>
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="post বা author খুঁজুন..."
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-cyan-300"
                />
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  <span>Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-cyan-300"
                  >
                    {categories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm text-slate-300">
                  <span>Sort</span>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 outline-none focus:border-cyan-300"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className={isImmersive ? "order-2" : ""}>
          {loading ? <p className="text-sm text-slate-400">public posts লোড হচ্ছে...</p> : null}
          {error ? <p className="mt-2 text-sm text-rose-300">{error}</p> : null}

          <div className={`mt-4 grid gap-4 ${isImmersive ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3"}`}>
            {filteredPosts.map((post, index) => {
              const commentsVisible = activeCommentPostId === post.id;
              const profileHref = post.author_username
                ? `/u/${encodeURIComponent(post.author_username)}`
                : post.profile_id
                  ? `/p/${encodeURIComponent(post.profile_id)}`
                  : null;
              const isExpanded = expandedPosts[post.id] ?? false;
              const needsExpansion = post.fact_text.length > 220;
              const displayText = needsExpansion && !isExpanded ? `${post.fact_text.slice(0, 220)}...` : post.fact_text;

              return (
                <article
                  key={post.id}
                  className={`rounded-[24px] border border-white/10 bg-white/5 p-4 sm:rounded-[28px] ${
                    isImmersive ? "overflow-hidden border-cyan-300/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.08),_rgba(15,23,42,0.28))] p-0" : ""
                  }`}
                >
                  {isImmersive ? (
                    <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(145deg,_rgba(15,23,42,0.15),_rgba(15,23,42,0.4))] px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-cyan-300/10 text-cyan-100">
                            <LayoutGrid className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">{post.category}</p>
                            {profileHref && !post.is_anonymous ? (
                              <Link href={profileHref} className="mt-1 block text-sm font-semibold text-slate-100 hover:text-cyan-200">
                                {post.author_display_name || post.display_name || "পাঠক"}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm font-semibold text-slate-100">
                                {post.is_anonymous ? "Anonymous writer" : post.author_display_name || post.display_name || "পাঠক"}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300">
                            #{index + 1}
                          </span>
                          <span className="rounded-full border border-amber-300/15 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                            {post.like_count * 3 + post.comment_count * 2} score
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className={isImmersive ? "px-5 py-4" : ""}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {!isImmersive ? <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{post.category}</p> : null}
                      {post.author_username && !post.is_anonymous ? (
                        <Link
                          href={profileHref ?? `/chat?to=${encodeURIComponent(post.author_username)}`}
                          className="max-w-full truncate rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold tracking-[0.1em] text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:tracking-[0.18em]"
                        >
                          id: @{post.author_username}
                        </Link>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-cyan-100">
                          post id: {post.id.slice(0, 8)}
                        </span>
                      )}
                    </div>

                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedPosts((current) => ({
                            ...current,
                            [post.id]: !isExpanded,
                          }))
                        }
                        className="w-full text-left"
                      >
                        <p className="text-sm leading-7 text-slate-200 sm:text-[15px]">{displayText}</p>
                      </button>
                      {needsExpansion ? (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPosts((current) => ({
                              ...current,
                              [post.id]: !isExpanded,
                            }))
                          }
                          className="mt-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
                        >
                          {isExpanded ? "show less" : "more read"}
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-col items-start gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      {post.is_anonymous ? (
                        <span>অ্যানোনিমাস</span>
                      ) : post.author_username ? (
                        <Link
                          href={profileHref ?? `/chat?to=${encodeURIComponent(post.author_username)}`}
                          className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
                        >
                          <UserRound className="h-4 w-4" />
                          <span className="truncate">@{post.author_username}</span>
                          <MessageSquareText className="h-4 w-4" />
                        </Link>
                      ) : (
                        <span>{post.author_display_name || post.display_name || "পাঠক"}</span>
                      )}
                      <span>{formatDisplayDate(post.created_at)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => void handleLikeToggle(post.id)}
                        disabled={busyLikeId === post.id}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          post.viewer_has_liked
                            ? "bg-rose-300 text-slate-950 hover:bg-rose-200"
                            : "border border-white/10 bg-white/5 text-slate-200 hover:border-rose-300/40 hover:bg-rose-300/10"
                        } disabled:opacity-60`}
                      >
                        <Heart className={`h-4 w-4 ${post.viewer_has_liked ? "fill-current" : ""}`} />
                        <span>{post.like_count}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveCommentPostId(commentsVisible ? null : post.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>{post.comment_count}</span>
                      </button>
                      {isImmersive ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-100">
                          <TrendingUp className="h-3.5 w-3.5" />
                          author gains {post.like_count} point
                        </span>
                      ) : null}
                    </div>

                    {commentsVisible ? (
                      <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                        <div className="space-y-3">
                          {post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                                  {comment.author_username ? (
                                    <Link href={`/u/${encodeURIComponent(comment.author_username)}`} className="text-cyan-100 hover:text-cyan-200">
                                      @{comment.author_username}
                                    </Link>
                                  ) : comment.profile_id ? (
                                    <Link href={`/p/${encodeURIComponent(comment.profile_id)}`} className="text-cyan-100 hover:text-cyan-200">
                                      {comment.author_display_name || comment.display_name || "পাঠক"}
                                    </Link>
                                  ) : (
                                    <span>{comment.author_display_name || comment.display_name || "পাঠক"}</span>
                                  )}
                                  <span>{formatDisplayDate(comment.created_at)}</span>
                                </div>
                                <p className="mt-2 text-sm leading-7 text-slate-200">{comment.comment_text}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">এখনো কোনো comment নেই। প্রথম comment আপনি দিতে পারেন।</p>
                          )}
                        </div>

                        <form onSubmit={(event) => void handleCommentSubmit(event, post.id)} className="space-y-3">
                          <textarea
                            value={commentDrafts[post.id] ?? ""}
                            onChange={(event) =>
                              setCommentDrafts((current) => ({
                                ...current,
                                [post.id]: event.target.value,
                              }))
                            }
                            rows={isImmersive ? 4 : 3}
                            placeholder={user ? "আপনার comment লিখুন..." : "comment করতে login লাগবে"}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none focus:border-cyan-300"
                          />
                          <button
                            type="submit"
                            disabled={busyCommentId === post.id}
                            className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
                          >
                            <Send className="h-4 w-4" />
                            {busyCommentId === post.id ? "পাঠানো হচ্ছে..." : "comment দিন"}
                          </button>
                        </form>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {!loading && filteredPosts.length === 0 ? (
            <div className="mt-5 rounded-[28px] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
              এই filter-এ কোনো post পাওয়া যায়নি।{" "}
              <Link href="/share" className="text-cyan-200 underline decoration-cyan-300/50 underline-offset-4">
                নতুন তথ্য শেয়ার করুন
              </Link>
              ।
            </div>
          ) : null}
        </div>

        {isImmersive ? (
          <>
            <aside className="order-1 hidden space-y-4 xl:sticky xl:top-28 xl:block xl:self-start">
              {feedControls}
            </aside>
          </>
        ) : null}
      </div>
    </section>
  );
}
