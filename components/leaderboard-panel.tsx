"use client";

import { useEffect, useState } from "react";
import { leaderboard as fallbackLeaderboard } from "@/lib/site-data";
import { fetchLeaderboardRecords } from "@/lib/supabase";

type PanelEntry = {
  name: string;
  points: number;
  title: string;
};

export function LeaderboardPanel() {
  const [entries, setEntries] = useState<PanelEntry[]>(fallbackLeaderboard);

  useEffect(() => {
    let active = true;

    void fetchLeaderboardRecords(10).then(({ data }) => {
      if (!active || !data?.length) return;

      setEntries(
        data.map((entry, index, all) => ({
          name: entry.display_name,
          points: entry.points,
          title:
            index === 0
              ? "মগজরাজ"
              : index === all.length - 1
                ? "চেষ্টা চলছে মামা"
                : entry.level >= 20
                  ? "মহাকাশচারী চাণক্য"
                  : "রহস্য শিকারি",
        })),
      );
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="glass-panel rounded-[34px] p-5 sm:p-7">
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className={`grid items-center gap-3 rounded-3xl border p-4 md:grid-cols-[56px_1fr_auto] ${index === 0 ? "border-amber-300/40 bg-amber-300/10" : "border-white/10 bg-white/5"}`}
            >
              <div className="text-2xl font-black text-cyan-200">#{index + 1}</div>
              <div>
                <p className="text-lg font-bold">{entry.name}</p>
                <p className="text-sm text-slate-300">{entry.title}</p>
              </div>
              <div className="text-left font-bold text-amber-200 md:text-right">{entry.points} XP</div>
            </div>
          ))}
        </div>
      </section>

      <aside className="space-y-6">
        <div className="glass-panel rounded-[34px] p-6 sm:p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Weekly Champion</p>
          <h2 className="mt-3 text-3xl font-black">{entries[0]?.name}</h2>
          <p className="mt-2 text-slate-300">{entries[0]?.title}</p>
        </div>
      </aside>
    </main>
  );
}
