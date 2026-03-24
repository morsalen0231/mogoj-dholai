"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bell, Clock3, FilePenLine, Heart, MessageCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  fetchPostNotifications,
  markNotificationsAsRead,
  type PostNotificationWithActor,
} from "@/lib/supabase";

function formatRelativeDate(value: string) {
  return new Date(value).toLocaleString("en-US");
}

function getNotificationMeta(item: PostNotificationWithActor) {
  switch (item.type) {
    case "like":
      return {
        title: `${item.actor_username ? `@${item.actor_username}` : item.actor_display_name || "একজন পাঠক"} আপনার post-এ like দিয়েছে`,
        href: "/community",
        cta: "feed খুলুন",
        icon: Heart,
      };
    case "comment":
      return {
        title: `${item.actor_username ? `@${item.actor_username}` : item.actor_display_name || "একজন পাঠক"} আপনার post-এ comment করেছে`,
        href: "/community",
        cta: "feed খুলুন",
        icon: MessageCircle,
      };
    case "post_submission":
      return {
        title: `${item.actor_username ? `@${item.actor_username}` : item.actor_display_name || "একজন user"} নতুন public post submit করেছে`,
        href: "/admin",
        cta: "review করুন",
        icon: Clock3,
      };
    case "article_submission":
      return {
        title: `${item.actor_username ? `@${item.actor_username}` : item.actor_display_name || "একজন user"} নতুন article submit করেছে`,
        href: "/admin",
        cta: "review করুন",
        icon: FilePenLine,
      };
    case "article_review":
      return {
        title: item.body_text,
        href: "/write",
        cta: "status দেখুন",
        icon: FilePenLine,
      };
  }
}

export function NotificationsPanel() {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<PostNotificationWithActor[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      return;
    }

    let active = true;

    async function load() {
      const { data, error: fetchError } = await fetchPostNotifications(user.id, 50);
      if (!active) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
        setBusy(false);
        return;
      }

      setNotifications(data ?? []);
      setBusy(false);

      const hasUnread = (data ?? []).some((item) => item.read_at === null);
      if (hasUnread) {
        await markNotificationsAsRead(user.id);
        if (!active) {
          return;
        }
        setNotifications((current) =>
          current.map((item) => ({
            ...item,
            read_at: item.read_at ?? new Date().toISOString(),
          })),
        );
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [loading, user]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.read_at === null).length,
    [notifications],
  );

  if (!user) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">নোটিফিকেশন দেখতে লগইন করুন।</div>;
  }

  if (loading || busy) {
    return <div className="glass-panel rounded-[34px] p-7 text-slate-300">নোটিফিকেশন লোড হচ্ছে...</div>;
  }

  if (error) {
    return <div className="glass-panel rounded-[34px] p-7 text-rose-300">{error}</div>;
  }

  return (
    <section className="glass-panel rounded-[34px] p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Bell className="h-4 w-4" />
            Notification Inbox
          </p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Recent activity</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          unread before open: {unreadCount}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {notifications.map((item) => (
          (() => {
            const meta = getNotificationMeta(item);
            const Icon = meta.icon;

            return (
              <article
                key={item.id}
                className={`rounded-[24px] border p-4 ${
                  item.read_at
                    ? "border-white/10 bg-white/5"
                    : "border-cyan-300/20 bg-cyan-300/10"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-slate-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{meta.title}</p>
                      <p className="mt-2 text-sm leading-7 text-slate-300">{item.body_text}</p>
                      <p className="mt-2 text-xs text-slate-400">{formatRelativeDate(item.created_at)}</p>
                    </div>
                  </div>
                  <Link
                    href={meta.href}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {meta.cta}
                  </Link>
                </div>
              </article>
            );
          })()
        ))}
      </div>

      {notifications.length === 0 ? (
        <div className="mt-5 rounded-[28px] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
          এখনো কোনো notification নেই।
        </div>
      ) : null}
    </section>
  );
}
