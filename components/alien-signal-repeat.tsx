"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, RadioTower, RefreshCcw, Trophy, Waves } from "lucide-react";

const signalPads = [
  { emoji: "🛸", label: "alien" },
  { emoji: "📡", label: "signal" },
  { emoji: "🪐", label: "orbit" },
  { emoji: "🌌", label: "void" },
];

function randomIndex() {
  return Math.floor(Math.random() * signalPads.length);
}

export function AlienSignalRepeat() {
  const [sequence, setSequence] = useState<number[]>([randomIndex()]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [round, setRound] = useState(1);
  const [bestRound, setBestRound] = useState(1);
  const [message, setMessage] = useState("alien signal observe করুন, তারপর repeat করুন।");
  const [resetSeed, setResetSeed] = useState(1);

  useEffect(() => {
    if (!showing) return;

    let cancelled = false;
    let step = 0;

    const runSequence = () => {
      if (cancelled) return;
      if (step >= sequence.length) {
        setActivePad(null);
        setShowing(false);
        setMessage("এখন আপনার পালা। একই signal sequence tap করুন।");
        return;
      }

      const nextPad = sequence[step];
      setActivePad(nextPad);

      window.setTimeout(() => {
        if (cancelled) return;
        setActivePad(null);
        step += 1;
        window.setTimeout(runSequence, 180);
      }, 420);
    };

    const starter = window.setTimeout(runSequence, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(starter);
    };
  }, [resetSeed, sequence, showing]);

  function handlePadPress(index: number) {
    if (showing) return;

    setActivePad(index);
    window.setTimeout(() => setActivePad(null), 150);

    if (sequence[playerIndex] !== index) {
      setBestRound((current) => Math.max(current, round));
      setMessage(`signal jam হয়ে গেছে। আপনি round ${round} পর্যন্ত গিয়েছিলেন। আবার শুরু করুন।`);
      setSequence([randomIndex()]);
      setShowing(true);
      setPlayerIndex(0);
      setRound(1);
      setResetSeed((current) => current + 1);
      return;
    }

    const nextIndex = playerIndex + 1;
    if (nextIndex === sequence.length) {
      const nextRound = round + 1;
      setBestRound((current) => Math.max(current, nextRound));
      setMessage("ঠিক sequence। aliens এবার আরও বড় pattern পাঠাচ্ছে।");
      setSequence((current) => [...current, randomIndex()]);
      setShowing(true);
      setPlayerIndex(0);
      setRound(nextRound);
      setResetSeed((current) => current + 1);
      return;
    }

    setPlayerIndex(nextIndex);
  }

  function restartSignals() {
    setSequence([randomIndex()]);
    setActivePad(null);
    setShowing(true);
    setPlayerIndex(0);
    setRound(1);
    setMessage("নতুন signal stream শুরু হলো।");
    setResetSeed((current) => current + 1);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
            <RadioTower className="h-4 w-4" />
            Infinite Signal Memory
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">Alien Signal Repeat</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            alienরা emoji-signal sequence পাঠাবে। আপনাকে একই pattern repeat করতে হবে। round যত বাড়বে,
            sequence তত লম্বা হবে।
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(236,72,153,0.18),_rgba(56,189,248,0.18),_rgba(250,204,21,0.22))] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-100">
            <Trophy className="h-4 w-4" />
            Memory Stats
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Round</p>
              <p className="mt-2 text-2xl font-black text-white">{round}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Best</p>
              <p className="mt-2 text-2xl font-black text-white">{bestRound}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Length</p>
              <p className="mt-2 text-2xl font-black text-white">{sequence.length}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={restartSignals}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-950/35"
          >
            <RefreshCcw className="h-4 w-4" />
            signal reset
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-5 sm:p-6">
        <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
          <Waves className="h-4 w-4" />
          sequence chamber
        </p>
        <p className="mt-3 text-sm leading-7 text-slate-300">{message}</p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {signalPads.map((pad, index) => (
            <button
              key={pad.label}
              type="button"
              onClick={() => handlePadPress(index)}
              className={`rounded-[28px] border p-6 text-center transition ${
                activePad === index
                  ? "border-cyan-300/40 bg-cyan-300/15 shadow-[0_0_35px_rgba(34,211,238,0.16)]"
                  : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <span className="block text-4xl">{pad.emoji}</span>
              <span className="mt-3 block text-xs uppercase tracking-[0.2em] text-slate-300">{pad.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
          <p className="inline-flex items-center gap-2 font-semibold text-fuchsia-100">
            <BrainCircuit className="h-4 w-4" />
            Funny note
          </p>
          <p className="mt-2">
            round ১০ পার হলে officially আপনি comment section-এর চেয়ে অনেক বেশি reliable memory unit।
          </p>
        </div>
      </div>
    </section>
  );
}
