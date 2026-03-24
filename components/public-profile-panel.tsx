"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MapPin, MessageSquareText, Sparkles, UserCircle2 } from "lucide-react";
import { fetchProfileByUsername, fetchProfileRecord, type ProfileRecord } from "@/lib/supabase";

export function PublicProfilePanel({
  username,
  profileId,
}: {
  username?: string;
  profileId?: string;
}) {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const result = username
        ? await fetchProfileByUsername(username)
        : profileId
          ? await fetchProfileRecord(profileId)
          : { data: null, error: { message: "প্রোফাইল পাওয়া যায়নি।" } };

      if (!active) return;

      if (result.error || !result.data) {
        setError(result.error?.message ?? "প্রোফাইল পাওয়া যায়নি।");
      } else {
        setProfile(result.data);
      }

      setLoading(false);
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [profileId, username]);

  if (loading) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">প্রোফাইল লোড হচ্ছে...</div>;
  }

  if (error || !profile) {
    return <div className="glass-panel rounded-[34px] p-7 text-rose-300">{error ?? "প্রোফাইল পাওয়া যায়নি।"}</div>;
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="glass-panel rounded-[34px] p-7">
        <div className="mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border-4 border-cyan-300 bg-white/5 shadow-[0_0_50px_rgba(34,211,238,0.35)]">
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-cyan-100">
              <UserCircle2 className="h-16 w-16" />
            </span>
          )}
        </div>

        <h2 className="mt-6 text-center text-3xl font-black">{profile.display_name}</h2>
        <p className="mt-2 text-center text-sm text-cyan-200">@{profile.username || "username নেই"}</p>
        <p className="mt-3 text-center text-sm text-slate-300">{profile.tagline || "community member"}</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            level {profile.level}
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
            {profile.points} XP
          </span>
        </div>
      </section>

      <section className="glass-panel rounded-[34px] p-7">
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Bio</p>
            <p className="mt-3 text-sm leading-7 text-slate-300">{profile.bio || "এখনো bio দেওয়া হয়নি।"}</p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <Sparkles className="h-4 w-4 text-cyan-200" />
              {profile.favorite_topic || "মহাকাশ"}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
              <MapPin className="h-4 w-4 text-cyan-200" />
              {profile.location || "location নেই"}
            </span>
          </div>

          {profile.username ? (
            <Link
              href={`/chat?to=${encodeURIComponent(profile.username)}`}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              <MessageSquareText className="h-4 w-4" />
              direct chat
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
