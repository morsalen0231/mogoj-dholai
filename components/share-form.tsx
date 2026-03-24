"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { CircleUserRound, LogIn, Send, Shield, Shapes, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient, insertUserPostRecord, upsertProfileRecord } from "@/lib/supabase";

const categories = ["রহস্য", "বিজ্ঞান", "ইতিহাস", "লাইফ হ্যাক"];

export function ShareForm() {
  const { user, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [factText, setFactText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase || !user) {
      setError("post করতে হলে আগে লগইন করুন।");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const name =
      displayName.trim() ||
      (user.user_metadata?.display_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "গোপন দাতা";

    const { error: profileError } = await upsertProfileRecord({
      id: user.id,
      session_id: user.id,
      display_name: name,
      email: user.email ?? "",
      ...(user.app_metadata?.provider === "google" || user.email_confirmed_at
        ? { email_verified: true }
        : {}),
      level: 1,
    });

    if (profileError) {
      setError(profileError.message);
      setBusy(false);
      return;
    }

    const { error: insertError } = await insertUserPostRecord({
      profile_id: user.id,
      display_name: name,
      is_anonymous: isAnonymous,
      category,
      fact_text: factText.trim(),
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setMessage("তথ্য জমা হয়েছে। admin approve করলে ৫০ point bonus যাবে।");
      setFactText("");
      setDisplayName("");
      setIsAnonymous(false);
    }

    setBusy(false);
  }

  if (loading) {
    return <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur">session দেখছি...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-[36px] border border-white/10 bg-white/5 p-8 backdrop-blur">
        <p className="text-base leading-8 text-slate-300">
          post করতে হলে আগে account-এ ঢুকতে হবে।
        </p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-rose-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-rose-200">
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <label className="block text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <CircleUserRound className="h-4 w-4" />
          আপনার নাম
        </span>
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-rose-300"
        />
      </label>
      <label className="block text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <Shapes className="h-4 w-4" />
          ক্যাটাগরি
        </span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-[#1f1120] px-4 py-3 outline-none focus:border-rose-300"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm text-slate-300">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          আজব তথ্য
        </span>
        <textarea
          value={factText}
          onChange={(event) => setFactText(event.target.value)}
          rows={5}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-rose-300"
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.target.checked)}
          className="h-5 w-5 rounded border-white/10 bg-white/5"
        />
        <Shield className="h-4 w-4" />
        অ্যানোনিমাস মোড চালু করুন
      </label>
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-rose-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-rose-200 disabled:opacity-60">
        <Send className="h-4 w-4" />
        {busy ? "জমা হচ্ছে..." : "জ্ঞান ঝাড়ুন"}
      </button>
    </form>
  );
}
