import type { Metadata } from "next";
import Link from "next/link";
import { Brain, Clock3, Compass, Flame, Rocket, ShieldPlus } from "lucide-react";
import { PublicPostsWall } from "@/components/public-posts-wall";
import { SiteShell } from "@/components/site-shell";
import { articles as fallbackArticles, categories } from "@/lib/site-data";
import { getSiteUrl } from "@/lib/site-url";
import { fetchLeaderboardRecords, fetchPublicArticlesServer } from "@/lib/supabase";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "বাংলা Knowledge Hub",
  description: "রহস্য, ইতিহাস, বিজ্ঞান, গেম আর লাইফ হ্যাক নিয়ে বাংলা interactive knowledge hub।",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "রহস্যঘর",
    description: "রহস্য, ইতিহাস, বিজ্ঞান, গেম আর লাইফ হ্যাক নিয়ে বাংলা interactive knowledge hub।",
    url: siteUrl,
    type: "website",
  },
};

export default async function Home() {
  const [{ data: articleData }, { data: leaderboardData }] = await Promise.all([
    fetchPublicArticlesServer(),
    fetchLeaderboardRecords(1),
  ]);
  const articles = articleData?.length ? articleData : fallbackArticles;
  const weeklyChampion = leaderboardData?.[0]
    ? {
        name: leaderboardData[0].display_name,
        title: `Level ${leaderboardData[0].level}`,
      }
    : {
        name: "রহস্যঘর যাত্রী",
        title: "Level 1",
      };
  const categoryDecor = {
    A: {
      icon: Rocket,
      mood: "Cosmic suspense",
      kicker: "গ্রহ, এলিয়েন, ভবিষ্যৎ",
      bullets: ["UFO lore", "Mars future", "Space audio"],
    },
    B: {
      icon: Compass,
      mood: "Forbidden archive",
      kicker: "হারানো শহর, যুদ্ধ, চুরি",
      bullets: ["Ancient curse", "War secrets", "History heists"],
    },
    C: {
      icon: Brain,
      mood: "Human lab",
      kicker: "মস্তিষ্ক, DNA, AI",
      bullets: ["Body secrets", "Dream science", "Future tech"],
    },
    D: {
      icon: Flame,
      mood: "Brain workout",
      kicker: "quiz, puzzle, memory",
      bullets: ["IQ test", "Optical tricks", "Typing race"],
    },
    E: {
      icon: ShieldPlus,
      mood: "Real-life upgrade",
      kicker: "survival, focus, fitness",
      bullets: ["Mind reading", "Food science", "Productivity"],
    },
  } as const;

  return (
    <SiteShell eyebrow="" title="" description="">
      <main className="space-y-8 sm:space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-[30px] p-5 sm:rounded-[36px] sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">৩০টি কনটেন্ট পেজ</p>
            <h2 className="mt-3 text-[1.7rem] font-black leading-tight sm:text-4xl">পাঁচ ক্যাটাগরি, ত্রিশটা curious rabbit hole</h2>
            <p className="mt-4 max-w-2xl text-[14px] leading-7 text-slate-300 sm:text-base sm:leading-8">
              Space থেকে Life Hacks পর্যন্ত সব category card-এ quick jump আছে। Archive থেকে filter
              করে browse করা যাবে, আর প্রতিটি page playful বাংলা tone-এ সাজানো।
            </p>
            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/archive" className="w-full rounded-full bg-cyan-300 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-200 sm:w-auto">
                আর্কাইভ ঘাঁটুন
              </Link>
              <Link href="/games" className="w-full rounded-full bg-amber-300 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-amber-200 sm:w-auto">
                গেম খেলুন
              </Link>
              <Link href="/chat" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center font-bold transition hover:border-fuchsia-300/40 hover:bg-fuchsia-300/10 sm:w-auto">
                ইনভিজিবল চ্যাটে ঢুকুন
              </Link>
            </div>
          </div>
          <div className="rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,_rgba(34,197,94,0.22),_rgba(14,165,233,0.16),_rgba(6,182,212,0.1))] p-5 sm:rounded-[36px] sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-emerald-100">সাপ্তাহিক চ্যাম্পিয়ন</p>
            <h3 className="mt-3 text-[1.7rem] font-black leading-tight sm:text-2xl">{weeklyChampion.name}</h3>
            <p className="mt-2 text-sm text-emerald-100">{weeklyChampion.title}</p>
            <div className="mt-5 h-24 rounded-[24px] border border-white/10 bg-[radial-gradient(circle_at_50%_25%,_rgba(250,204,21,0.45),_transparent_22%),linear-gradient(180deg,_rgba(12,18,36,0.6),_rgba(3,7,18,0.95))] sm:mt-6 sm:h-28 sm:rounded-[28px]" />
            <p className="mt-5 text-sm leading-7 text-slate-200">প্রতি সপ্তাহে top scorer-এর profile spotlight home page-এ বড় করে দেখানো হবে।</p>
          </div>
        </section>
        <section id="categories" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const categoryArticles = articles.filter((article) => article.categoryId === category.id);
            const decor = categoryDecor[category.id];
            const Icon = decor.icon;

            return (
              <article key={category.id} className="glass-panel rounded-[30px] p-4 transition duration-300 sm:rounded-[34px] sm:p-6">
                <Link href={`/archive#${category.slug}`} className={`relative block overflow-hidden rounded-[24px] border border-white/10 bg-gradient-to-br p-4 transition duration-300 hover:scale-[1.01] sm:rounded-[28px] sm:p-6 ${category.accent}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.28em] text-slate-950/70">Category {category.id}</p>
                      <p className="mt-2 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{decor.mood}</p>
                      <p className="mt-2 text-[13px] text-slate-950/80 sm:text-sm">{decor.kicker}</p>
                    </div>
                    <div className="relative rounded-2xl border border-black/10 bg-white/25 p-2.5 text-slate-950 shadow-[0_10px_30px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-3">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <div className="relative mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-black/10 bg-white/20 px-3 py-1.5 text-xs font-semibold text-slate-950">
                      {categoryArticles.length}টি পেজ
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white/20 px-3 py-1.5 text-xs font-semibold text-slate-950">
                      <Clock3 className="h-3.5 w-3.5" />
                      Quick dive
                    </span>
                  </div>
                </Link>

                <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
                  {decor.bullets.map((bullet) => (
                    <span key={bullet} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-slate-300 sm:px-3 sm:text-xs sm:tracking-[0.18em]">
                      {bullet}
                    </span>
                  ))}
                </div>

                <p className="mt-5 text-xs uppercase tracking-[0.3em] text-cyan-200 sm:text-sm">Category {category.id}</p>
                <h2 className="mt-2 text-xl font-bold leading-tight sm:text-2xl">
                  <Link href={`/archive#${category.slug}`} className="hover:text-cyan-200">
                    {category.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{category.subtitle}</p>
                <div className="mt-5">
                  <Link href={`/archive#${category.slug}`} className="inline-flex w-full justify-center rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15 sm:w-auto">
                    এই ক্যাটাগরি ঘাঁটুন
                  </Link>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {categoryArticles.map((article) => (
                    <Link key={article.slug} href={`/articles/${article.slug}`} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] leading-5 transition hover:border-white/20 hover:bg-white/10 sm:rounded-full sm:text-sm">
                      {article.id}: {article.titleBn}
                    </Link>
                  ))}
                </div>
              </article>
            );
          })}
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <div id="profile-engine" className="glass-panel rounded-[30px] p-5 sm:rounded-[34px] sm:p-7">
            <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Profile Engine</p>
            <h2 className="mt-3 text-3xl font-black">আপনার মগজের কুষ্ঠি</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              article পড়া, quiz score, scroll, chat activity সব মিলিয়ে XP বাড়বে; level glow, badge,
              আর playful title দিয়ে profile evolve করবে।
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/profile" className="w-full rounded-full bg-amber-300 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-amber-200 sm:w-auto">
                প্রোফাইল দেখুন
              </Link>
              <Link href="/leaderboard" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center font-bold transition hover:border-amber-300/40 hover:bg-amber-300/10 sm:w-auto">
                leaderboard খুলুন
              </Link>
            </div>
          </div>
          <div id="community" className="glass-panel rounded-[30px] p-5 sm:rounded-[34px] sm:p-7">
            <p className="text-sm uppercase tracking-[0.3em] text-rose-200">Community Input</p>
            <h2 className="mt-3 text-3xl font-black">গপপো মারার কল</h2>
            <p className="mt-4 text-base leading-8 text-slate-300">
              user odd facts submit করবে, admin approve করলে ৫০ bonus point পাবে, চাইলে anonymous
              mode-ও থাকবে।
            </p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/community" className="w-full rounded-full bg-cyan-300 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-cyan-200 sm:w-auto">
                কমিউনিটি ফিড
              </Link>
              <Link href="/share" className="w-full rounded-full bg-rose-300 px-5 py-3 text-center font-bold text-slate-950 transition hover:bg-rose-200 sm:w-auto">
                জ্ঞান ঝাড়ুন
              </Link>
              <Link href="/feedback" className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-center font-bold transition hover:border-rose-300/40 hover:bg-rose-300/10 sm:w-auto">
                feedback দিন
              </Link>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[30px] p-5 sm:rounded-[34px] sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Game System</p>
              <h2 className="mt-3 text-3xl font-black">হাসতে হাসতে brain test</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                myth smash, timeline fixer, আর odd-but-true challenge দিয়ে funny knowledge game system
                যোগ করা হয়েছে। boring quiz mood না, বরং playful arcade vibe।
              </p>
            </div>
            <Link
              href="/games"
              className="inline-flex rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-5 py-3 text-sm font-bold text-fuchsia-100 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-300/15"
            >
              গেম জোন খুলুন
            </Link>
          </div>
        </section>

        <section id="public-feed">
          <PublicPostsWall />
        </section>
      </main>
    </SiteShell>
  );
}
