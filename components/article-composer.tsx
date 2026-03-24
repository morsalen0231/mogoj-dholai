"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, FilePenLine, LogIn, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  type ArticleRecord,
  fetchOwnArticleRecords,
  submitArticleRecord,
} from "@/lib/supabase";
import { categories, type CategoryId } from "@/lib/site-data";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatRemainingTime(value: string) {
  const diff = new Date(value).getTime() - Date.now();
  if (diff <= 0) {
    return "যে কোনো সময় publish হবে";
  }

  const totalMinutes = Math.ceil(diff / 60000);
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  if (hours > 0) {
    return `${hours}ঘ ${minutes}মি বাকি`;
  }

  return `${Math.max(minutes, 1)} মিনিট বাকি`;
}

const initialForm = {
  category_id: categories[0]?.id ?? "A",
  title_bn: "",
  title_en: "",
  slug: "",
  cover_label: "",
  teaser: "",
  content_standard: "",
  content_funny: "",
  fun_fact: "",
  tags: "",
  image_url: "",
};

export function ArticleComposer() {
  const { user, profile, loading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [aiTopic, setAiTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [myArticles, setMyArticles] = useState<ArticleRecord[]>([]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    async function loadOwnArticles() {
      const { data, error: fetchError } = await fetchOwnArticleRecords(user.id);
      if (!active) return;

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      setMyArticles(data ?? []);
    }

    void loadOwnArticles();

    return () => {
      active = false;
    };
  }, [user]);

  const derivedSlug = useMemo(() => slugify(form.slug || form.title_bn), [form.slug, form.title_bn]);
  const visibleArticles = user ? myArticles : [];

  async function handleGenerateWithAi() {
    if (!user) return;

    const topic = aiTopic.trim() || form.title_bn.trim();
    if (!topic) {
      setError("AI generate করতে topic বা title দিন।");
      return;
    }

    setAiBusy(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/generate-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: form.category_id,
          topic,
        }),
      });

      const result = (await response.json()) as typeof initialForm & { error?: string };
      if (!response.ok) {
        setError(result.error ?? "AI generate করা যায়নি।");
        setAiBusy(false);
        return;
      }

      setForm((current) => ({
        ...current,
        title_bn: result.title_bn ?? current.title_bn,
        title_en: result.title_en ?? current.title_en,
        slug: result.slug ?? current.slug,
        cover_label: result.cover_label ?? current.cover_label,
        teaser: result.teaser ?? current.teaser,
        content_standard: result.content_standard ?? current.content_standard,
        content_funny: result.content_funny ?? current.content_funny,
        fun_fact: result.fun_fact ?? current.fun_fact,
        tags: result.tags ?? current.tags,
        image_url: result.image_url ?? current.image_url,
      }));
      setMessage("AI draft তৈরি হয়েছে। দেখে নিয়ে submit করুন।");
    } catch {
      setError("AI generate request failed.");
    }

    setAiBusy(false);
  }

  async function handleSubmit() {
    if (!user) return;

    setBusy(true);
    setError(null);
    setMessage(null);

    const payload = {
      id: `${form.category_id}-${Date.now()}`,
      profile_id: user.id,
      slug: derivedSlug,
      category_id: form.category_id as CategoryId,
      title_bn: form.title_bn.trim(),
      title_en: form.title_en.trim() || form.title_bn.trim(),
      cover_label: form.cover_label.trim() || form.title_bn.trim(),
      teaser: form.teaser.trim(),
      content_standard: form.content_standard.trim(),
      content_funny: form.content_funny.trim() || form.content_standard.trim(),
      fun_fact: form.fun_fact.trim(),
      tags: form.tags.trim(),
      image_url: form.image_url.trim(),
    };

    if (!payload.slug || !payload.title_bn || !payload.teaser || !payload.content_standard) {
      setError("title, slug, teaser, আর main content লাগবে।");
      setBusy(false);
      return;
    }

    const { error: submitError } = await submitArticleRecord(payload);
    if (submitError) {
      setError(submitError.message);
      setBusy(false);
      return;
    }

    const { data, error: fetchError } = await fetchOwnArticleRecords(user.id);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMyArticles(data ?? []);
      setMessage("article submit হয়েছে। admin চাইলে 10 মিনিটের মধ্যে approve/reject করবে, নাহলে auto-publish হবে।");
      setForm(initialForm);
    }

    setBusy(false);
  }

  if (loading) {
    return <div className="glass-panel rounded-[34px] p-6 text-slate-300">article panel লোড হচ্ছে...</div>;
  }

  if (!user) {
    return (
      <div className="glass-panel rounded-[34px] p-6 text-slate-300">
        <p>article submit করতে আগে login লাগবে।</p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="glass-panel rounded-[34px] p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
              <FilePenLine className="h-4 w-4" />
              Article Submission
            </p>
            <h2 className="mt-2 text-2xl font-black">নতুন article লিখুন</h2>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            author: {profile?.display_name ?? user.email ?? "user"}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          <div className="rounded-[24px] border border-emerald-300/15 bg-emerald-300/10 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <input
                value={aiTopic}
                onChange={(event) => setAiTopic(event.target.value)}
                placeholder="AI topic দিন, যেমন মহাকাশে হারানো সিগনাল"
                className="rounded-2xl border border-white/10 bg-[#101b28] px-4 py-3 outline-none focus:border-emerald-300"
              />
              <button
                type="button"
                onClick={() => void handleGenerateWithAi()}
                disabled={aiBusy}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {aiBusy ? "AI লিখছে..." : "AI draft বানান"}
              </button>
            </div>
            <p className="mt-3 text-sm text-emerald-50/85">
              topic দিলে Groq AI title, teaser, main content, funny version, fun fact, tags auto-fill করবে।
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={form.category_id}
              onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value as CategoryId }))}
              className="rounded-2xl border border-white/10 bg-[#101b28] px-4 py-3 outline-none focus:border-cyan-300"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.id} · {category.title}
                </option>
              ))}
            </select>
            <input
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="slug, যেমন ancient-library-mystery"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
            />
          </div>

          <input value={form.title_bn} onChange={(event) => setForm((current) => ({ ...current, title_bn: event.target.value }))} placeholder="বাংলা title" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <input value={form.title_en} onChange={(event) => setForm((current) => ({ ...current, title_en: event.target.value }))} placeholder="English title" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <input value={form.cover_label} onChange={(event) => setForm((current) => ({ ...current, cover_label: event.target.value }))} placeholder="cover label" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <textarea value={form.teaser} onChange={(event) => setForm((current) => ({ ...current, teaser: event.target.value }))} rows={2} placeholder="১-২ লাইনের teaser" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <textarea value={form.content_standard} onChange={(event) => setForm((current) => ({ ...current, content_standard: event.target.value }))} rows={6} placeholder={"main content\nপ্রতি paragraph newline দিয়ে"} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <textarea value={form.content_funny} onChange={(event) => setForm((current) => ({ ...current, content_funny: event.target.value }))} rows={5} placeholder={"funny version\nনা লিখলে main content ব্যবহার হবে"} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          <div className="grid gap-4 md:grid-cols-2">
            <input value={form.fun_fact} onChange={(event) => setForm((current) => ({ ...current, fun_fact: event.target.value }))} placeholder="fun fact" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
            <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="tag1, tag2, tag3" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
          </div>
          <input value={form.image_url} onChange={(event) => setForm((current) => ({ ...current, image_url: event.target.value }))} placeholder="/covers/my-cover" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300" />
        </div>

        <div className="mt-4 rounded-[24px] border border-cyan-300/15 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
          submit করার পর 10 মিনিট review window থাকবে। admin approve/reject না করলে post auto-publish হবে।
        </div>

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}

        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {busy ? "submit হচ্ছে..." : "article submit করুন"}
        </button>
      </section>

      <section className="glass-panel rounded-[34px] p-5 sm:p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200">My Submissions</p>
        <div className="mt-5 space-y-3">
          {visibleArticles.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              এখনো কোনো article submit করা হয়নি।
            </div>
          ) : (
            visibleArticles.map((article) => (
              <article key={article.id} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {article.category_id} · {article.status}
                    </p>
                    <h3 className="mt-2 text-lg font-bold">{article.title_bn}</h3>
                    <p className="mt-1 text-xs text-cyan-200">/{article.slug ?? "slug নেই"}</p>
                  </div>
                  {article.status === "pending" ? (
                    <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-100">
                      <Clock3 className="h-3.5 w-3.5" />
                      {formatRemainingTime(article.auto_publish_at)}
                    </div>
                  ) : null}
                </div>
                {article.teaser ? <p className="mt-3 text-sm leading-7 text-slate-300">{article.teaser}</p> : null}
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
