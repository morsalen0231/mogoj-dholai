"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, FilePlus2, LogIn, MessageSquareText, Save, ShieldAlert, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  type ArticleStatus,
  type ArticleRecord,
  type FeedbackRecord,
  type UserPostRecord,
  fetchAdminArticleRecords,
  fetchAdminFeedback,
  fetchAdminPosts,
  fetchProfileRecord,
  upsertArticleRecord,
  updateArticleStatus,
  updateUserPostStatus,
} from "@/lib/supabase";
import { categories } from "@/lib/site-data";

export function AdminPanel() {
  const { user, loading } = useAuth();
  const [role, setRole] = useState<"reader" | "admin" | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [posts, setPosts] = useState<UserPostRecord[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackRecord[]>([]);
  const [articles, setArticles] = useState<ArticleRecord[]>([]);
  const [busyPostId, setBusyPostId] = useState<string | null>(null);
  const [busyArticleId, setBusyArticleId] = useState<string | null>(null);
  const [articleBusy, setArticleBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [articleMessage, setArticleMessage] = useState<string | null>(null);
  const [articleForm, setArticleForm] = useState({
    id: "",
    slug: "",
    category_id: categories[0]?.id ?? "A",
    title_bn: "",
    title_en: "",
    cover_label: "",
    teaser: "",
    content_standard: "",
    content_funny: "",
    fun_fact: "",
    tags: "",
    image_url: "",
  });

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const authenticatedUser = user;

    let active = true;

    async function loadAdminData() {
      const { data: profile, error: profileError } = await fetchProfileRecord(authenticatedUser.id);

      if (!active) return;
      if (profileError) {
        setError(profileError.message);
        setPageLoading(false);
        return;
      }

      const nextRole = profile?.role ?? "reader";
      setRole(nextRole);

      if (nextRole !== "admin") {
        setPageLoading(false);
        return;
      }

      const [
        { data: postData, error: postError },
        { data: feedbackData, error: feedbackError },
        { data: articleData, error: articleError },
      ] = await Promise.all([fetchAdminPosts(), fetchAdminFeedback(), fetchAdminArticleRecords()]);

      if (!active) return;

      if (postError) {
        setError(postError.message);
      } else {
        setPosts(postData ?? []);
      }

      if (feedbackError) {
        setError(feedbackError.message);
      } else {
        setFeedbackItems(feedbackData ?? []);
      }

      if (articleError) {
        setError(articleError.message);
      } else {
        setArticles(articleData ?? []);
      }

      setPageLoading(false);
    }

    void loadAdminData();

    return () => {
      active = false;
    };
  }, [loading, user]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  async function handleStatusChange(id: string, status: "approved" | "rejected") {
    setBusyPostId(id);
    setError(null);

    const { error: updateError } = await updateUserPostStatus(id, status);

    if (updateError) {
      setError(updateError.message);
    } else {
      setPosts((current) =>
        current.map((post) => (post.id === id ? { ...post, status } : post)),
      );
    }

    setBusyPostId(null);
  }

  async function handleArticleSave() {
    setArticleBusy(true);
    setError(null);
    setArticleMessage(null);

    const payload = {
      ...articleForm,
      id: articleForm.id.trim(),
      slug: articleForm.slug.trim().toLowerCase(),
      title_bn: articleForm.title_bn.trim(),
      title_en: articleForm.title_en.trim(),
      cover_label: articleForm.cover_label.trim(),
      teaser: articleForm.teaser.trim(),
      content_standard: articleForm.content_standard.trim(),
      content_funny: articleForm.content_funny.trim(),
      fun_fact: articleForm.fun_fact.trim(),
      tags: articleForm.tags.trim(),
      image_url: articleForm.image_url.trim(),
    };

    if (!payload.id || !payload.slug || !payload.title_bn) {
      setError("article id, slug, title_bn লাগবে।");
      setArticleBusy(false);
      return;
    }

    const { error: saveError } = await upsertArticleRecord(payload);
    if (saveError) {
      setError(saveError.message);
      setArticleBusy(false);
      return;
    }

    const { data: articleData, error: articleError } = await fetchAdminArticleRecords();
    if (articleError) {
      setError(articleError.message);
    } else {
      setArticles(articleData ?? []);
      setArticleMessage("article save হয়েছে।");
      setArticleForm({
        id: "",
        slug: "",
        category_id: categories[0]?.id ?? "A",
        title_bn: "",
        title_en: "",
        cover_label: "",
        teaser: "",
        content_standard: "",
        content_funny: "",
        fun_fact: "",
        tags: "",
        image_url: "",
      });
    }

    setArticleBusy(false);
  }

  async function refreshArticles() {
    const { data: articleData, error: articleError } = await fetchAdminArticleRecords();
    if (articleError) {
      setError(articleError.message);
      return;
    }

    setArticles(articleData ?? []);
  }

  async function handleArticleModeration(id: string, status: Exclude<ArticleStatus, "pending">) {
    if (!user) return;

    setBusyArticleId(id);
    setError(null);

    const now = new Date().toISOString();
    const { error: updateError } = await updateArticleStatus(id, {
      status,
      reviewed_by: user.id,
      reviewed_at: now,
      published_at: status === "approved" ? now : null,
    });

    if (updateError) {
      setError(updateError.message);
      setBusyArticleId(null);
      return;
    }

    await refreshArticles();
    setBusyArticleId(null);
  }

  function loadArticleIntoForm(article: ArticleRecord) {
    setArticleForm({
      id: article.id,
      slug: article.slug ?? "",
      category_id: article.category_id as "A" | "B" | "C" | "D" | "E",
      title_bn: article.title_bn,
      title_en: article.title_en ?? "",
      cover_label: article.cover_label ?? "",
      teaser: article.teaser ?? "",
      content_standard: article.content_standard,
      content_funny: article.content_funny,
      fun_fact: article.fun_fact ?? "",
      tags: article.tags ?? "",
      image_url: article.image_url ?? "",
    });
    setArticleMessage(`editing ${article.id}`);
  }

  const pendingArticles = articles.filter((article) => article.status === "pending");
  const reviewedArticles = articles.filter((article) => article.status !== "pending");

  if (loading || pageLoading) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">admin data লোড হচ্ছে...</div>;
  }

  if (!user) {
    return (
      <div className="glass-panel rounded-[34px] p-7 text-slate-300">
        <p>admin panel দেখতে হলে আগে লগইন করুন।</p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Link>
      </div>
    );
  }

  if (role !== "admin") {
    return (
      <div className="glass-panel rounded-[34px] p-7 text-slate-300">
        <p className="inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-200" />
          এই page শুধু admin role user-এর জন্য।
        </p>
        <p className="mt-3 text-sm text-slate-400">বর্তমান role: {role ?? "reader"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <div className="glass-panel rounded-[34px] p-5 text-rose-300">{error}</div> : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel rounded-[34px] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Pending Share List</p>
              <h2 className="mt-2 text-2xl font-black">তথ্য approve / reject করুন</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Sparkles className="h-4 w-4" />
              মোট: {posts.length}
            </div>
          </div>

          <div className="space-y-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      {post.category} · {post.status}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">
                      {post.is_anonymous ? "অ্যানোনিমাস" : post.display_name || "নামহীন"}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(post.created_at).toLocaleString("en-US")}
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-300">{post.fact_text}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(post.id, "approved")}
                    disabled={busyPostId === post.id}
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(post.id, "rejected")}
                    disabled={busyPostId === post.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold transition hover:border-rose-300/40 hover:bg-rose-300/10 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    reject
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[34px] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
                <MessageSquareText className="h-4 w-4" />
                Feedback List
              </p>
              <h2 className="mt-2 text-2xl font-black">user মতামত</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <ShieldCheck className="h-4 w-4" />
              মোট: {feedbackItems.length}
            </div>
          </div>

          <div className="space-y-4">
            {feedbackItems.map((item) => (
              <article key={item.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-lg font-bold">
                    {item.emoji_rating ?? "💬"} {item.subject}
                  </p>
                  <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString("en-US")}</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.message}</p>
                <p className="mt-3 text-xs text-slate-400">user_id: {item.user_id ?? "unknown"}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[34px] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
                <FilePlus2 className="h-4 w-4" />
                Article Review
              </p>
              <h2 className="mt-2 text-2xl font-black">pending article approve / reject</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              pending: {pendingArticles.length}
            </div>
          </div>

          <div className="space-y-4">
            {pendingArticles.length === 0 ? (
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                এই মুহূর্তে pending article নেই।
              </div>
            ) : (
              pendingArticles.map((article) => {
                const remainingMinutes = Math.max(0, Math.ceil((new Date(article.auto_publish_at).getTime() - nowMs) / 60000));

                return (
                  <article key={article.id} className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                          {article.category_id} · {article.status}
                        </p>
                        <h3 className="mt-2 text-lg font-bold">{article.title_bn}</h3>
                        <p className="mt-1 text-xs text-cyan-200">/{article.slug ?? "slug নেই"}</p>
                      </div>
                      <div className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100">
                        {remainingMinutes > 0 ? `${remainingMinutes} মিনিট বাকি` : "auto-publish due"}
                      </div>
                    </div>
                    {article.teaser ? <p className="mt-3 text-sm leading-7 text-slate-300">{article.teaser}</p> : null}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleArticleModeration(article.id, "approved")}
                        disabled={busyArticleId === article.id}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-300 px-4 py-2 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        approve
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleArticleModeration(article.id, "rejected")}
                        disabled={busyArticleId === article.id}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold transition hover:border-rose-300/40 hover:bg-rose-300/10 disabled:opacity-60"
                      >
                        <XCircle className="h-4 w-4" />
                        reject
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-panel rounded-[34px] p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
                <FilePlus2 className="h-4 w-4" />
                Admin Article Editor
              </p>
              <h2 className="mt-2 text-2xl font-black">article edit / override</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              মোট article: {articles.length}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <input value={articleForm.id} onChange={(event) => setArticleForm((current) => ({ ...current, id: event.target.value }))} placeholder="A7" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
              <input value={articleForm.slug} onChange={(event) => setArticleForm((current) => ({ ...current, slug: event.target.value }))} placeholder="moon-base-secrets" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
              <select value={articleForm.category_id} onChange={(event) => setArticleForm((current) => ({ ...current, category_id: event.target.value as "A" | "B" | "C" | "D" | "E" }))} className="rounded-2xl border border-white/10 bg-[#101b28] px-4 py-3 outline-none focus:border-cyan-300">
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.id} · {category.title}
                  </option>
                ))}
              </select>
            </div>

            <input value={articleForm.title_bn} onChange={(event) => setArticleForm((current) => ({ ...current, title_bn: event.target.value }))} placeholder="বাংলা title" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={articleForm.title_en} onChange={(event) => setArticleForm((current) => ({ ...current, title_en: event.target.value }))} placeholder="English title" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={articleForm.cover_label} onChange={(event) => setArticleForm((current) => ({ ...current, cover_label: event.target.value }))} placeholder="cover label" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <textarea value={articleForm.teaser} onChange={(event) => setArticleForm((current) => ({ ...current, teaser: event.target.value }))} rows={2} placeholder="teaser" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <textarea value={articleForm.content_standard} onChange={(event) => setArticleForm((current) => ({ ...current, content_standard: event.target.value }))} rows={5} placeholder={"standard content\nপ্রতি paragraph newline দিয়ে"} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <textarea value={articleForm.content_funny} onChange={(event) => setArticleForm((current) => ({ ...current, content_funny: event.target.value }))} rows={5} placeholder={"funny content\nপ্রতি paragraph newline দিয়ে"} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={articleForm.fun_fact} onChange={(event) => setArticleForm((current) => ({ ...current, fun_fact: event.target.value }))} placeholder="fun fact" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={articleForm.tags} onChange={(event) => setArticleForm((current) => ({ ...current, tags: event.target.value }))} placeholder="tag1, tag2, tag3" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={articleForm.image_url} onChange={(event) => setArticleForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="/covers/moon-base" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          </div>

          {articleMessage ? <p className="mt-4 text-sm text-emerald-300">{articleMessage}</p> : null}

          <div className="mt-5">
            <button
              type="button"
              onClick={() => void handleArticleSave()}
              disabled={articleBusy}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {articleBusy ? "save হচ্ছে..." : "article save করুন"}
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[34px] p-5 sm:p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Reviewed Articles</p>
          <div className="mt-5 space-y-3">
            {reviewedArticles.map((article) => (
              <article key={article.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {article.id} · {article.category_id} · {article.status}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{article.title_bn}</h3>
                    <p className="mt-1 text-xs text-cyan-200">/{article.slug ?? "slug নেই"}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadArticleIntoForm(article)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    edit
                  </button>
                </div>
                {article.teaser ? <p className="mt-3 text-sm leading-7 text-slate-300">{article.teaser}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
