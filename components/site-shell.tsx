"use client";

import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import {
  Archive,
  Bell,
  Crown,
  FilePenLine,
  Gamepad2,
  Home,
  LayoutGrid,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AmbientMotion } from "@/components/ambient-motion";
import { useAuth } from "@/components/auth-provider";
import { CursorAura } from "@/components/cursor-aura";
import { NavAuth } from "@/components/nav-auth";
import { SkyCreatures } from "@/components/sky-creatures";

const navGroups = [
  {
    label: "Explore",
    accent: "from-cyan-300/20 to-sky-300/10",
    items: [
      { href: "/", label: "হোম", icon: Home },
      { href: "/archive", label: "সব আর্টিকেল", icon: Archive },
      { href: "/community", label: "কমিউনিটি ফিড", icon: LayoutGrid },
      { href: "/games", label: "গেম জোন", icon: Gamepad2 },
    ],
  },
  {
    label: "Connect",
    accent: "from-amber-300/20 to-rose-300/10",
    items: [
      { href: "/share", label: "তথ্য শেয়ার", icon: Sparkles },
      { href: "/write", label: "আর্টিকেল লিখুন", icon: FilePenLine },
      { href: "/notifications", label: "নোটিফিকেশন", icon: Bell },
      { href: "/chat", label: "প্রাইভেট চ্যাট", icon: MessagesSquare },
    ],
  },
  {
    label: "Account",
    accent: "from-emerald-300/20 to-cyan-300/10",
    items: [
      { href: "/profile", label: "আমার প্রোফাইল", icon: UserRound },
      { href: "/leaderboard", label: "লিডারবোর্ড", icon: Crown },
      { href: "/admin", label: "অ্যাডমিন", icon: ShieldCheck, adminOnly: true },
    ],
  },
] as const;

export function SiteShell({
  children,
  title,
  eyebrow,
  description,
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  description: string;
}) {
  const { role } = useAuth();
  const showHeader = Boolean(eyebrow || title || description);
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || role === "admin"),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="site-chroma min-h-screen text-slate-100">
      <AmbientMotion />
      <SkyCreatures />
      <CursorAura />
      <div className="relative z-10 mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <nav className="glass-panel sticky top-2 z-30 mb-6 rounded-[22px] px-3 py-2.5 shadow-[0_18px_45px_rgba(2,6,23,0.42)] sm:top-3 sm:mb-8 sm:rounded-[30px] sm:px-5 sm:py-4">
          <div className="flex items-center justify-between gap-2.5 lg:grid lg:grid-cols-[220px_minmax(0,1fr)_220px] lg:items-center">
            <Link
              href="/"
              className="min-w-0 flex items-center gap-3 sm:gap-4"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-[0_10px_25px_rgba(34,211,238,0.18)] sm:h-14 sm:w-14">
                <Image src="/mogoj-logo.svg" alt="রহস্যঘর logo" fill className="object-contain" />
              </div>
              <div className="min-w-0">
                <div className="hidden text-base font-black leading-[1.05] tracking-[0.08em] text-cyan-200 sm:block sm:text-xl">
                  রহস্যঘর
                </div>
                <div className="mt-1 hidden text-xs font-medium uppercase tracking-[0.28em] text-slate-300 sm:block sm:text-[13px]">
                  curiosity hub
                </div>
                <div className="max-w-full rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-cyan-100 sm:hidden">
                  রহস্য
                </div>
              </div>
            </Link>

            <div className="hidden min-w-0 lg:flex lg:justify-center lg:gap-2">
              {visibleGroups.map((group) => (
                <div key={group.label} className="group relative -mb-3 pb-3">
                  <button
                    type="button"
                    className={`rounded-full border border-white/10 bg-gradient-to-r ${group.accent} px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/40 group-hover:border-cyan-300/40`}
                  >
                    {group.label}
                  </button>
                  <div className="pointer-events-none invisible absolute left-1/2 top-full z-40 w-64 -translate-x-1/2 pt-2 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100">
                    <div className="rounded-[24px] border border-white/10 bg-[rgba(7,17,31,0.96)] p-3 shadow-[0_24px_60px_rgba(2,6,23,0.28)]">
                    <div className="grid gap-2">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="inline-flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden justify-self-end lg:block">
              <NavAuth />
            </div>

            <div className="max-w-[58%] lg:hidden">
              <NavAuth />
            </div>
          </div>

          <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 no-scrollbar lg:hidden">
            {visibleGroups.flatMap((group) => group.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        {showHeader ? (
          <header className="mb-8 lg:mb-10">
            <div className="glass-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
              {eyebrow ? <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-cyan-200 sm:text-sm">{eyebrow}</p> : null}
              {title ? <h1 className="text-[1.8rem] font-black leading-[1.02] sm:text-5xl">{title}</h1> : null}
              {description ? <p className="mt-4 max-w-4xl text-[14px] leading-7 text-slate-300 sm:text-lg sm:leading-8">{description}</p> : null}
            </div>
          </header>
        ) : null}
        {children}
      </div>
    </div>
  );
}
