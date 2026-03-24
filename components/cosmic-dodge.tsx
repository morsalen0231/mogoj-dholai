"use client";

import { useEffect, useMemo, useState } from "react";
import { MoveHorizontal, Rocket, ShieldAlert, Sparkles, Trophy } from "lucide-react";

type Obstacle = {
  id: number;
  lane: number;
  progress: number;
  kind: "hazard" | "bonus";
  emoji: string;
};

const laneCount = 3;
const hazardEmoji = ["☄️", "🛰️", "🪨", "🛸"];
const bonusEmoji = ["⭐", "🧠", "💎"];

function randomFrom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function CosmicDodge() {
  const [running, setRunning] = useState(false);
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [speedLevel, setSpeedLevel] = useState(1);
  const [message, setMessage] = useState("lane বেছে rocket চালান। bonus ধরুন, hazard এড়ান।");
  const [seed, setSeed] = useState(1);

  const tickMs = useMemo(() => Math.max(140, 300 - (speedLevel - 1) * 12), [speedLevel]);
  const spawnChance = useMemo(() => Math.min(0.72, 0.32 + speedLevel * 0.015), [speedLevel]);

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setObstacles((current) => {
        let next = current
          .map((item) => ({ ...item, progress: item.progress + 12 }))
          .filter((item) => item.progress <= 100);

        const colliding = next.find((item) => item.progress >= 84 && item.progress <= 100 && item.lane === lane);
        if (colliding) {
          if (colliding.kind === "hazard") {
            setRunning(false);
            setBest((currentBest) => Math.max(currentBest, score));
            setMessage(`ধরা খেয়ে গেছেন। final score ${score}। আরেকবার চালান।`);
            next = [];
          } else {
            setScore((currentScore) => currentScore + 3);
            setMessage("bonus ধরা হয়েছে। rocket crew খুশি।");
            next = next.filter((item) => item.id !== colliding.id);
          }
        } else {
          setScore((currentScore) => currentScore + 1);
        }

        if (Math.random() < spawnChance && next.length < 8) {
          const kind: Obstacle["kind"] = Math.random() < 0.24 ? "bonus" : "hazard";
          next = [
            ...next,
            {
              id: Date.now() + Math.floor(Math.random() * 1000),
              lane: Math.floor(Math.random() * laneCount),
              progress: 0,
              kind,
              emoji: kind === "hazard" ? randomFrom(hazardEmoji) : randomFrom(bonusEmoji),
            },
          ];
        }

        return next;
      });
    }, tickMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [lane, running, score, spawnChance, tickMs]);

  useEffect(() => {
    setSpeedLevel(1 + Math.floor(score / 30));
  }, [score]);

  function startRun() {
    setRunning(true);
    setLane(1);
    setObstacles([]);
    setScore(0);
    setSpeedLevel(1);
    setMessage("চালু হয়েছে। lane বদলান আর টিকে থাকুন।");
    setSeed((current) => current + 1);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Rocket className="h-4 w-4" />
            Infinite Survival
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Cosmic Dodge Run</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            তিন lane-এর space highway-এ rocket চালান। hazard এড়ান, bonus ধরুন, আর speed level
            যত বাড়বে তত panic premium হবে।
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(56,189,248,0.18),_rgba(251,191,36,0.18),_rgba(244,63,94,0.24))] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-100">
            <Trophy className="h-4 w-4" />
            Run Stats
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Score</p>
              <p className="mt-2 text-2xl font-black text-white">{score}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Best</p>
              <p className="mt-2 text-2xl font-black text-white">{best}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Level</p>
              <p className="mt-2 text-2xl font-black text-white">{speedLevel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={startRun}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
          >
            <Sparkles className="h-4 w-4" />
            {running ? "run restart" : "run start"}
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
            <MoveHorizontal className="h-4 w-4" />
            lane control
          </p>
          <p className="text-sm text-slate-300">{message}</p>
        </div>

        <div key={seed} className="relative mx-auto h-[360px] max-w-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.9),_rgba(2,6,23,0.98))]">
          <div className="absolute inset-0 grid grid-cols-3">
            {Array.from({ length: laneCount }).map((_, index) => (
              <div
                key={index}
                className={`border-x border-white/5 ${lane === index ? "bg-cyan-300/8" : ""}`}
              />
            ))}
          </div>

          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={`line-${index}`}
              className="absolute left-0 right-0 h-px bg-white/6"
              style={{ top: `${index * 48 + 24}px` }}
            />
          ))}

          {obstacles.map((item) => (
            <div
              key={item.id}
              className={`absolute z-10 flex h-12 w-12 items-center justify-center rounded-full border text-2xl shadow-[0_10px_30px_rgba(15,23,42,0.35)] ${
                item.kind === "hazard"
                  ? "border-rose-300/40 bg-rose-300/15"
                  : "border-emerald-300/40 bg-emerald-300/15"
              }`}
              style={{
                left: `calc(${item.lane * (100 / 3)}% + 50% / 3 - 24px)`,
                top: `${item.progress * 3}px`,
              }}
            >
              {item.emoji}
            </div>
          ))}

          <div
            className="absolute bottom-4 z-20 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/12 text-3xl shadow-[0_0_30px_rgba(34,211,238,0.22)] transition-all duration-200"
            style={{ left: `calc(${lane * (100 / 3)}% + 50% / 3 - 28px)` }}
          >
            🚀
          </div>
        </div>

        <div className="mx-auto mt-5 grid max-w-[420px] grid-cols-3 gap-3">
          {Array.from({ length: laneCount }).map((_, index) => (
            <button
              key={`lane-${index}`}
              type="button"
              onClick={() => setLane(index)}
              className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                lane === index
                  ? "bg-cyan-300 text-slate-950"
                  : "border border-white/10 bg-white/5 text-slate-100 hover:border-cyan-300/40 hover:bg-cyan-300/10"
              }`}
            >
              lane {index + 1}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-cyan-100">Hazard</p>
            <p className="mt-2">☄️, 🛰️, 🪨, 🛸 ছুঁলেই run শেষ।</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            <p className="font-semibold text-emerald-100">Bonus</p>
            <p className="mt-2">⭐, 🧠, 💎 ধরলে extra score পাবেন।</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
            <p className="inline-flex items-center gap-2 font-semibold text-amber-100">
              <ShieldAlert className="h-4 w-4" />
              Long-play tip
            </p>
            <p className="mt-2">score বাড়লে speed বাড়বে, তাই এইটা সত্যিকারের endless survival feel দেবে।</p>
          </div>
        </div>
      </div>
    </section>
  );
}
