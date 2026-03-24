import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ShareForm } from "@/components/share-form";
import { SiteShell } from "@/components/site-shell";
import { PublicPostsWall } from "@/components/public-posts-wall";

export default function SharePage() {
  return (
    <SiteShell eyebrow="" title="" description="">
      <main className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[36px] border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-rose-300/40 hover:bg-rose-300/10">
            <ArrowLeft className="h-4 w-4" />
            হোমে ফিরুন
          </Link>
          <p className="text-sm uppercase tracking-[0.35em] text-rose-200">গপপো মারার কল</p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">আজব তথ্য শেয়ার করুন</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Admin approve করলে সঙ্গে সঙ্গে ৫০ point bonus। চাইলে anonymous mode-এও ভয়ঙ্কর তথ্য জমা
            দিতে পারবেন।
          </p>
          <div className="mt-4">
            <Link href="/community" className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/15">
              public কমিউনিটি ফিড দেখুন
            </Link>
          </div>
          <ShareForm />
        </div>

        <div id="public-posts" className="xl:col-span-2">
          <PublicPostsWall limit={9} />
        </div>
      </main>
    </SiteShell>
  );
}
