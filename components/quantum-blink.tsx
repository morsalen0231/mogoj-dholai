"use client";

import { useEffect, useState } from "react";
import { Gauge, RefreshCcw, Sparkles, Timer, Trophy, Zap } from "lucide-react";

const blinkSymbols = ["🧠", "⭐", "🪐", "⚡", "🌋", "🧪", "👁️", "☄️"];

function randomIndex(max: number) {
  return Math.floor(Math.random() * max);
}

export function QuantumBlink() {
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState(() => randomIndex(blinkSymbols.length));
  const [options, setOptions] = useState(() => Array.from({ length: 4 }, () => randomIndex(blinkSymbols.length)));
  const [timeLeft, setTimeLeft] = useState(3200);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [message, setMessage] = useState("target symbol match করুন before timer শেষ হয়।");

  useEffect(() => {
    if (!running) return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 100) {
          setRunning(false);
          setBest((bestScore) => Math.max(bestScore, score));
          setMessage(`সময় শেষ। আপনি round ${round} পর্যন্ত গিয়েছিলেন।`);
          return 0;
        }
        return current - 100;
      });
    }, 100);

    return () => {
      window.clearInterval(timer);
    };
  }, [round, running, score]);

  function makeRound(nextRound: number) {
    const nextTarget = randomIndex(blinkSymbols.length);
    const choices = new Set<number>([nextTarget]);

    while (choices.size < 4) {
      choices.add(randomIndex(blinkSymbols.length));
    }

    return {
      nextTarget,
      nextOptions: [...choices].sort(() => Math.random() - 0.5),
      nextTime: Math.max(900, 3200 - nextRound * 35),
    };
  }

  function chooseOption(index: number) {
    if (!running) return;

    if (options[index] === target) {
      const nextRound = round + 1;
      const { nextTarget, nextOptions, nextTime } = makeRound(nextRound);
      setScore((current) => current + 1);
      setRound(nextRound);
      setTarget(nextTarget);
      setOptions(nextOptions);
      setTimeLeft(nextTime);
      setMessage("ঠিক match। quantum blink আরও দ্রুত হচ্ছে।");
      return;
    }

    setRunning(false);
    setBest((bestScore) => Math.max(bestScore, score));
    setMessage("ভুল symbol। blink lab আপনাকে ধোঁকা দিল।");
  }

  function restart() {
    const { nextTarget, nextOptions, nextTime } = makeRound(1);
    setRound(1);
    setTarget(nextTarget);
    setOptions(nextOptions);
    setTimeLeft(nextTime);
    setRunning(true);
    setScore(0);
    setMessage("নতুন speed run শুরু হলো।");
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
            <Zap className="h-4 w-4" />
            Infinite Reaction
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Quantum Blink</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            target symbol দেখেই matching icon tap করুন। round বাড়লে time window ছোট হবে, তাই reflex
            আর panic management দুটোই লাগবে।
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(250,204,21,0.18),_rgba(56,189,248,0.18),_rgba(244,63,94,0.22))] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-100">
            <Trophy className="h-4 w-4" />
            Blink Stats
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Round</p>
              <p className="mt-2 text-2xl font-black text-white">{round}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Score</p>
              <p className="mt-2 text-2xl font-black text-white">{score}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Best</p>
              <p className="mt-2 text-2xl font-black text-white">{best}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={restart}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-950/35"
          >
            <RefreshCcw className="h-4 w-4" />
            blink reset
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Sparkles className="h-4 w-4" />
            target match room
          </p>
          <p className="text-sm text-slate-300">{message}</p>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 text-center">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Gauge className="h-4 w-4" />
              target
            </p>
            <div className="mt-4 text-7xl">{blinkSymbols[target]}</div>
            <div className="mt-4 rounded-full bg-white/10 p-2">
              <div
                className="h-3 rounded-full bg-[linear-gradient(90deg,_#facc15,_#22d3ee,_#fb7185)] transition-all"
                style={{ width: `${Math.max(4, (timeLeft / 3200) * 100)}%` }}
              />
            </div>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-slate-300">
              <Timer className="h-4 w-4" />
              {Math.ceil(timeLeft / 100) / 10}s
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <button
                key={`${option}-${index}-${round}`}
                type="button"
                onClick={() => chooseOption(index)}
                disabled={!running}
                className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-5xl transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-60"
              >
                {blinkSymbols[option]}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
