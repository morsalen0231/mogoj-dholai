"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, LogIn, LogOut, UserCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { fetchPostNotifications, getSupabaseBrowserClient } from "@/lib/supabase";

export function NavAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    void fetchPostNotifications(user.id, 20).then(({ data, error }) => {
      if (!active || error) {
        return;
      }

      setUnreadCount((data ?? []).filter((item) => item.read_at === null).length);
    });

    return () => {
      active = false;
    };
  }, [user]);

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setBusy(true);
    await supabase.auth.signOut();
    setBusy(false);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 sm:h-11 sm:w-11" />
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 sm:h-11 sm:w-11" />
        <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5 sm:h-11 sm:w-11" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/login" aria-label="লগইন" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cyan-300 text-slate-950 transition hover:bg-cyan-200 sm:h-11 sm:w-11">
        <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Link>
    );
  }

  const displayName =
    user.user_metadata?.display_name || user.email?.split("@")[0] || "গোপন প্রতিভা";
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href="/notifications" aria-label="নোটিফিকেশন" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 sm:h-11 sm:w-11">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-rose-300 px-1.5 py-0.5 text-[10px] font-bold text-slate-950">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </Link>
      <Link href="/profile" aria-label={displayName} className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 text-xs text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 sm:h-11 sm:w-11">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-cyan-300/20 text-cyan-100">
            <UserCircle2 className="h-4 w-4" />
          </span>
        )}
      </Link>
      <button
        type="button"
        aria-label={busy ? "লগআউট হচ্ছে" : "লগআউট"}
        onClick={handleLogout}
        disabled={busy}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xs transition hover:border-rose-300/40 hover:bg-rose-300/10 disabled:opacity-60 sm:h-11 sm:w-11"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
