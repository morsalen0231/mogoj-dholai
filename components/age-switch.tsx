"use client";

import { useState } from "react";

export function AgeSwitch({ standard, funny }: { standard: string[]; funny: string[] }) {
  const [mode, setMode] = useState<"kids" | "adult">("adult");
  const activeContent = mode === "adult" ? standard : funny;

  return (
    <section className="glass-panel rounded-[32px] p-6 sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Age Switch</p>
          <h2 className="mt-2 text-2xl font-bold">একই কনটেন্ট, দুই mood</h2>
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-slate-950/40 p-1">
          <button type="button" onClick={() => setMode("kids")} className={`rounded-full px-4 py-2 text-sm transition ${mode === "kids" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
            বাচ্চাদের জন্য সহজ
          </button>
          <button type="button" onClick={() => setMode("adult")} className={`rounded-full px-4 py-2 text-sm transition ${mode === "adult" ? "bg-amber-300 text-slate-950" : "text-slate-300"}`}>
            বড়দের জন্য জ্ঞানগর্ভ
          </button>
        </div>
      </div>
      <div className="space-y-4 text-base leading-8 text-slate-200">
        {activeContent.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
