"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, BookOpenText, BriefcaseBusiness, Gauge, ImageIcon, Mail, MapPin, MessageSquareText, PencilLine, Quote, Save, Sparkles, UserCircle2, UserPen, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { profileBadges } from "@/lib/site-data";
import { fetchOwnPosts, fetchProfileRecord, getSupabaseBrowserClient, type ProfileRecord, type UserPostRecord, upsertProfileRecord } from "@/lib/supabase";
import { EmailVerificationStatus } from "@/components/email-verification-status";

function levelFromPoints(points: number) {
  return Math.max(1, Math.min(100, Math.floor(points / 100) + 1));
}

export function ProfilePanel() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [favoriteTopic, setFavoriteTopic] = useState("মহাকাশ");
  const [username, setUsername] = useState("");
  const [tagline, setTagline] = useState("");
  const [location, setLocation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [ownPosts, setOwnPosts] = useState<UserPostRecord[]>([]);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    if (loading) return;
    if (!user || !supabase) return;
    const authenticatedUser = user;

    async function loadProfile() {
      setBusy(true);
      setError(null);

      const defaultName =
        authenticatedUser.user_metadata?.display_name ||
        authenticatedUser.user_metadata?.full_name ||
        authenticatedUser.email?.split("@")[0] ||
        "রহস্যঘর যাত্রী";

      // Auto-fill avatar from OAuth provider if available
      const oauthAvatar = authenticatedUser.user_metadata?.picture || authenticatedUser.user_metadata?.avatar_url || "";

      const { error: upsertError } = await upsertProfileRecord({
        id: authenticatedUser.id,
        session_id: authenticatedUser.id,
        display_name: defaultName,
        email: authenticatedUser.email ?? "",
        ...(authenticatedUser.app_metadata?.provider === "google" || authenticatedUser.email_confirmed_at
          ? { email_verified: true }
          : {}),
        level: 1,
      });

      if (upsertError) {
        setError(upsertError.message);
      } else {
        const { data, error: fetchError } = await fetchProfileRecord(authenticatedUser.id);
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setProfile(data);
          setDisplayName(data?.display_name ?? defaultName);
          setUsername(data?.username ?? "");
          setBio(data?.bio ?? "");
          setTagline(data?.tagline ?? "");
          setAvatarUrl(data?.avatar_url || oauthAvatar || ""); // Use OAuth avatar as fallback
          setFavoriteTopic(data?.favorite_topic ?? "মহাকাশ");
          setLocation(data?.location ?? "");
          setOccupation(data?.occupation ?? "");
        }
      }

      const { data: postData } = await fetchOwnPosts(authenticatedUser.id);
      setOwnPosts(postData ?? []);

      setBusy(false);
    }

    void loadProfile();
  }, [loading, user]);

  const xpProgress = useMemo(() => {
    const points = profile?.points ?? 0;
    return Math.min(100, points % 100);
  }, [profile]);

  if (loading || busy) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">প্রোফাইল লোড হচ্ছে...</div>;
  }

  if (!user) {
    return (
      <div className="glass-panel rounded-[34px] p-7 text-slate-300">
        profile দেখতে হলে আগে লগইন করুন।
      </div>
    );
  }

  if (error) {
    return <div className="glass-panel rounded-[34px] p-7 text-rose-300">{error}</div>;
  }

  const points = profile?.points ?? 0;
  const level = profile?.level ?? levelFromPoints(points);
  const badgeList = profile?.badges?.length ? profile.badges : profileBadges;
  const avatarPreview = avatarUrl.trim() || profile?.avatar_url || "";
  const publicUsername = profile?.username?.trim() || "";

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }

    setBusy(true);
    setError(null);
    setSaveMessage(null);

    const finalName = displayName.trim() || user.email?.split("@")[0] || "রহস্যঘর যাত্রী";
    const finalUsername = username.trim().toLowerCase().replace(/\s+/g, "-");

    const { error: saveError } = await upsertProfileRecord({
      id: user.id,
      session_id: user.id,
      display_name: finalName,
      email: user.email ?? "",
      ...(user.app_metadata?.provider === "google" || user.email_confirmed_at
        ? { email_verified: true }
        : {}),
      username: finalUsername,
      bio: bio.trim(),
      tagline: tagline.trim(),
      avatar_url: avatarUrl.trim(),
      favorite_topic: favoriteTopic.trim(),
      location: location.trim(),
      occupation: occupation.trim(),
      level,
    });

    if (saveError) {
      setError(saveError.message);
      setBusy(false);
      return;
    }

    const { error: authError } = await supabase.auth.updateUser({
      data: {
        display_name: finalName,
        avatar_url: avatarUrl.trim(),
        username: finalUsername,
      },
    });

    if (authError) {
      setError(authError.message);
      setBusy(false);
      return;
    }

    const { data, error: fetchError } = await fetchProfileRecord(user.id);
    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProfile(data);
      setSaveMessage("প্রোফাইল আপডেট হয়েছে। navbar-এও নতুন নাম/ছবি দেখা যাবে।");
    }

    setBusy(false);
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section id="identity" className="glass-panel rounded-[34px] p-7">
        <div className="mx-auto flex h-44 w-44 items-center justify-center overflow-hidden rounded-full border-4 border-cyan-300 bg-white/5 shadow-[0_0_50px_rgba(34,211,238,0.45)]">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt={profile?.display_name ?? "profile"} className="h-full w-full object-cover" />
          ) : (
            <span className="text-cyan-100">
              <UserCircle2 className="h-16 w-16" />
            </span>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-black">{profile?.display_name}</h2>
        <p className="mt-2 text-center text-sm text-fuchsia-200">{profile?.tagline || "এখনও tagline দেওয়া হয়নি"}</p>
        <p className="mt-2 inline-flex w-full items-center justify-center gap-2 text-center text-slate-300">
          <Gauge className="h-4 w-4 text-cyan-200" />
          লেভেল {level}
          <Mail className="ml-2 h-4 w-4 text-cyan-200" />
          {user.email}
        </p>
        <p className="mt-2 text-center text-xs uppercase tracking-[0.25em] text-amber-200">
          @{profile?.username || "username নেই"} · role: {profile?.role ?? "reader"}
        </p>
        <p className="mt-2 inline-flex w-full items-center justify-center gap-2 text-center text-sm text-cyan-100">
          <BookOpenText className="h-4 w-4" />
          পছন্দের টপিক: {profile?.favorite_topic ?? favoriteTopic}
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <MapPin className="h-4 w-4 text-cyan-200" />
            {profile?.location || "লোকেশন দেওয়া হয়নি"}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <BriefcaseBusiness className="h-4 w-4 text-cyan-200" />
            {profile?.occupation || "পেশা দেওয়া হয়নি"}
          </span>
        </div>
        <div className="mt-4 flex justify-center">
          {publicUsername ? (
            <Link
              href={`/chat?to=${encodeURIComponent(publicUsername)}`}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              <MessageSquareText className="h-4 w-4" />
              message
            </Link>
          ) : (
            <p className="text-xs text-slate-400">message option পেতে username set করুন।</p>
          )}
        </div>
        <div className="mt-6 rounded-full bg-white/10 p-2">
          <div className="h-4 rounded-full bg-[linear-gradient(90deg,_#22d3ee,_#facc15,_#fb7185)]" style={{ width: `${Math.max(8, xpProgress)}%` }} />
        </div>
        <p className="mt-3 text-sm text-slate-300">XP: {points} · next level progress {xpProgress}%</p>
        <p className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
          {profile?.bio || "এখনও bio দেওয়া হয়নি। নিজের vibe, জ্ঞান, আর mission লিখে দিন।"}
        </p>
        <EmailVerificationStatus email={user.email || ""} isVerified={profile?.email_verified} />      </section>

      <section className="space-y-6">
        <form id="edit-profile" onSubmit={handleSaveProfile} className="glass-panel rounded-[34px] p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
            <PencilLine className="h-4 w-4" />
            Profile Edit
          </p>
          <label className="mt-5 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <UserCircle2 className="h-4 w-4" />
              display name
            </span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <UserPen className="h-4 w-4" />
              username
            </span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="morsalen0231"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Quote className="h-4 w-4" />
              tagline
            </span>
            <input
              value={tagline}
              onChange={(event) => setTagline(event.target.value)}
              placeholder="রাতে রহস্য, সকালে বিজ্ঞান"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              avatar image URL
            </span>
            <input
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              favorite topic
            </span>
            <input
              value={favoriteTopic}
              onChange={(event) => setFavoriteTopic(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              location
            </span>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <BriefcaseBusiness className="h-4 w-4" />
              occupation
            </span>
            <input
              value={occupation}
              onChange={(event) => setOccupation(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          <label className="mt-4 block text-sm text-slate-300">
            <span className="inline-flex items-center gap-2">
              <BookOpenText className="h-4 w-4" />
              bio
            </span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-fuchsia-300"
            />
          </label>
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          {saveMessage ? <p className="mt-4 text-sm text-emerald-300">{saveMessage}</p> : null}
          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-full bg-fuchsia-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-fuchsia-200 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {busy ? "সেভ হচ্ছে..." : "প্রোফাইল সেভ করুন"}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-rose-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-rose-300"
            >
              <LogOut className="h-4 w-4" />
              লগ আউট করুন
            </button>
          </div>
        </form>

        <div className="glass-panel rounded-[34px] p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <BadgeCheck className="h-4 w-4" />
            Badges
          </p>
          <div className="mt-5 space-y-3">
            {badgeList.map((badge) => (
              <div key={badge} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                {badge}
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-[34px] p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
            <Gauge className="h-4 w-4" />
            XP Sources
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Approved post</div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Future quiz wins</div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Chat activity +5 XP</div>
          </div>
        </div>
        <div id="my-posts" className="glass-panel rounded-[34px] p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <BookOpenText className="h-4 w-4" />
            আমার পোস্ট
          </p>
          <div className="mt-5 space-y-4">
            {ownPosts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">
                এখনো কোনো post নেই। Share page থেকে প্রথম public knowledge post দিন।
              </div>
            ) : (
              ownPosts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                      {post.category} · {post.status}
                    </p>
                    <p className="text-xs text-slate-400">{new Date(post.created_at).toLocaleDateString("en-US")}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{post.fact_text}</p>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
