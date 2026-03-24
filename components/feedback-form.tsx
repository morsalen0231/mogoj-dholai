"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LogIn, MessageSquareText, Send, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { insertFeedbackRecord } from "@/lib/supabase";

const moods = ["😍", "🤔", "😴", "😡"];

export function FeedbackForm() {
  const { user, loading } = useAuth();
  const [emoji, setEmoji] = useState(moods[0]);
  const [subject, setSubject] = useState("আপনি সেরা");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      setError("feedback দিতে হলে আগে লগইন করুন।");
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const { error: insertError } = await insertFeedbackRecord({
      user_id: user.id,
      emoji_rating: emoji,
      subject,
      message: message.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("ফিডব্যাক জমা হয়েছে। ধন্যবাদ, মগজ নাড়ানোর জন্য।");
      setMessage("");
    }

    setBusy(false);
  }

  if (loading) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">session দেখছি...</div>;
  }

  if (!user) {
    return (
      <div className="glass-panel rounded-[34px] p-7 text-slate-300">
        <p>feedback database-এ পাঠাতে হলে আগে login দরকার।</p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Link>
      </div>
    );
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-panel rounded-[34px] p-7">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
          <Sparkles className="h-4 w-4" />
          Emoji Rating
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-4xl">
          {moods.map((mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => setEmoji(mood)}
              className={`rounded-3xl border px-5 py-4 transition hover:-translate-y-1 ${emoji === mood ? "border-cyan-300/50 bg-cyan-300/10" : "border-white/10 bg-white/5"}`}
            >
              {mood}
            </button>
          ))}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="glass-panel rounded-[34px] p-7">
        <label className="block text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" />
            সাবজেক্ট
          </span>
          <select
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#112133] px-4 py-3 outline-none focus:border-cyan-300"
          >
            <option>আপনি সেরা</option>
            <option>একটা ভুল ধরলাম</option>
            <option>আমি এর চেয়ে ভালো জানি</option>
          </select>
        </label>
        <label className="mt-5 block text-sm text-slate-300">
          <span className="inline-flex items-center gap-2">
            <MessageSquareText className="h-4 w-4" />
            মেসেজ
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={6}
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
          />
        </label>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {success ? <p className="mt-4 text-sm text-emerald-300">{success}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {busy ? "পাঠানো হচ্ছে..." : "পাঠিয়ে দিন"}
        </button>
      </form>
    </main>
  );
}
