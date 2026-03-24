"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Eye, Orbit, RefreshCcw, Sparkles, Trophy } from "lucide-react";

type MemoryFact = {
  id: string;
  emoji: string;
  label: string;
};

const memoryPool: MemoryFact[] = [
  { id: "octopus", emoji: "🐙", label: "৩ হৃদয়" },
  { id: "saturn", emoji: "🪐", label: "ভাসতে পারে" },
  { id: "brain", emoji: "🧠", label: "১০% myth" },
  { id: "bee", emoji: "🐝", label: "নাচে clue দেয়" },
  { id: "moon", emoji: "🌕", label: "জোয়ার টানে" },
  { id: "dna", emoji: "🧬", label: "gene code" },
  { id: "atom", emoji: "⚛️", label: "tiny but serious" },
  { id: "sun", emoji: "☀️", label: "১৩ লাখ পৃথিবী" },
];

const sizePool = [
  { id: "moon", label: "চাঁদ", size: 36, color: "bg-slate-300" },
  { id: "mars", label: "মঙ্গল", size: 44, color: "bg-rose-300" },
  { id: "earth", label: "পৃথিবী", size: 56, color: "bg-cyan-300" },
  { id: "venus", label: "শুক্র", size: 60, color: "bg-orange-300" },
  { id: "neptune", label: "নেপচুন", size: 74, color: "bg-indigo-400" },
  { id: "uranus", label: "ইউরেনাস", size: 82, color: "bg-teal-300" },
  { id: "saturn", label: "শনি", size: 90, color: "bg-amber-300" },
  { id: "jupiter", label: "বৃহস্পতি", size: 102, color: "bg-lime-300" },
];

const oddThemes = [
  { title: "সমুদ্র clue", core: ["🐋", "🦑", "🐟", "🪼"], odd: ["🚲", "🧱", "🍕"], reveal: "এই জিনিসটা marine biology class-এ আসে না।" },
  { title: "মহাকাশ clue", core: ["🌕", "🪐", "☄️", "🌌"], odd: ["🍔", "👟", "🎸"], reveal: "space vibe maintain করতে না পারায় এটা odd one." },
  { title: "brain clue", core: ["🧠", "💭", "⚡", "🧬"], odd: ["🪵", "🚗", "🍟"], reveal: "মগজ discussion-এর মধ্যে এই item একটু random tourist." },
  { title: "history clue", core: ["🏺", "👑", "🗿", "⚔️"], odd: ["🛹", "📱", "🎧"], reveal: "history table-এ modern visitor ঢুকে পড়েছে।" },
] as const;

function sampleWithoutReplacement<T>(items: T[], count: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function makeMemoryDeck(level: number) {
  const pairCount = Math.min(4 + Math.floor((level - 1) / 2), memoryPool.length);
  return sampleWithoutReplacement(memoryPool, pairCount)
    .flatMap((card, index) => [
      { ...card, key: `${card.id}-${index}-a` },
      { ...card, key: `${card.id}-${index}-b` },
    ])
    .sort(() => Math.random() - 0.5);
}

function makeSizeRound(level: number) {
  const itemCount = Math.min(4 + Math.floor((level - 1) / 2), 6);
  const items = sampleWithoutReplacement(sizePool, itemCount);

  return {
    title: `size instinct level ${level}`,
    items,
  };
}

function makeOddRound(level: number) {
  const theme = oddThemes[level % oddThemes.length];
  const core = sampleWithoutReplacement([...theme.core], 3);
  const oddPick = sampleWithoutReplacement([...theme.odd], 1)[0];
  const options = [...core, oddPick].sort(() => Math.random() - 0.5);

  return {
    title: theme.title,
    options,
    correctIndex: options.findIndex((option) => option === oddPick),
    reveal: theme.reveal,
  };
}

export function VisualGameLab() {
  const [memoryLevel, setMemoryLevel] = useState(1);
  const [deck, setDeck] = useState(() => makeMemoryDeck(1));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryBest, setMemoryBest] = useState(0);

  const [sizeLevel, setSizeLevel] = useState(1);
  const [sizeRound, setSizeRound] = useState(() => makeSizeRound(1));
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeFeedback, setSizeFeedback] = useState<string | null>(null);
  const [sizeScore, setSizeScore] = useState(0);
  const [sizeBest, setSizeBest] = useState(0);

  const [oddLevel, setOddLevel] = useState(1);
  const [oddRound, setOddRound] = useState(() => makeOddRound(1));
  const [oddFeedback, setOddFeedback] = useState<string | null>(null);
  const [oddScore, setOddScore] = useState(0);
  const [oddBest, setOddBest] = useState(0);

  const totalVisualScore = useMemo(() => memoryScore + sizeScore + oddScore, [memoryScore, sizeScore, oddScore]);
  const totalPairs = new Set(deck.map((item) => item.id)).size;

  useEffect(() => {
    if (flipped.length !== 2) return;

    const [firstKey, secondKey] = flipped;
    const first = deck.find((card) => card.key === firstKey);
    const second = deck.find((card) => card.key === secondKey);
    if (!first || !second) return;

    const timer = window.setTimeout(() => {
      if (first.id === second.id) {
        setMatched((current) => [...current, first.id]);
        setMemoryScore((current) => current + 1);
        setMemoryBest((current) => Math.max(current, memoryScore + 1));
      }
      setFlipped([]);
    }, first.id === second.id ? 150 : 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deck, flipped, memoryScore]);

  useEffect(() => {
    if (totalPairs === 0 || matched.length !== totalPairs) return;

    const timer = window.setTimeout(() => {
      const nextLevel = memoryLevel + 1;
      setMemoryLevel(nextLevel);
      setDeck(makeMemoryDeck(nextLevel));
      setFlipped([]);
      setMatched([]);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [matched.length, memoryLevel, totalPairs]);

  function resetVisualGames() {
    setMemoryLevel(1);
    setDeck(makeMemoryDeck(1));
    setFlipped([]);
    setMatched([]);
    setMemoryScore(0);
    setMemoryBest(0);

    setSizeLevel(1);
    setSizeRound(makeSizeRound(1));
    setSelectedSizes([]);
    setSizeFeedback(null);
    setSizeScore(0);
    setSizeBest(0);

    setOddLevel(1);
    setOddRound(makeOddRound(1));
    setOddFeedback(null);
    setOddScore(0);
    setOddBest(0);
  }

  function flipCard(key: string, id: string) {
    if (flipped.includes(key) || matched.includes(id) || flipped.length === 2) return;
    setFlipped((current) => [...current, key]);
  }

  function chooseSizeItem(id: string) {
    if (selectedSizes.includes(id) || sizeFeedback) return;

    const next = [...selectedSizes, id];
    setSelectedSizes(next);

    if (next.length !== sizeRound.items.length) return;

    const picked = next
      .map((pickedId) => sizeRound.items.find((item) => item.id === pickedId))
      .filter((item): item is (typeof sizeRound.items)[number] => Boolean(item));

    const isCorrect = picked.every((item, index, array) => {
      if (index === 0) return true;
      return array[index - 1].size <= item.size;
    });

    if (isCorrect) {
      const nextScore = sizeScore + 1;
      const nextLevel = sizeLevel + 1;
      setSizeScore(nextScore);
      setSizeBest((current) => Math.max(current, nextScore));
      setSizeFeedback("Perfect tap-order। এবার আরও tough round আসছে।");

      window.setTimeout(() => {
        setSizeLevel(nextLevel);
        setSizeRound(makeSizeRound(nextLevel));
        setSelectedSizes([]);
        setSizeFeedback(null);
      }, 1000);
      return;
    }

    setSizeFeedback("ক্রমটা মেলেনি। আবার smallest থেকে চেষ্টা করুন।");
    window.setTimeout(() => {
      setSelectedSizes([]);
      setSizeFeedback(null);
    }, 900);
  }

  function chooseOdd(index: number) {
    if (oddFeedback) return;

    const isCorrect = index === oddRound.correctIndex;
    const nextScore = oddScore + (isCorrect ? 1 : 0);
    setOddScore(nextScore);
    setOddBest((current) => Math.max(current, nextScore));
    setOddFeedback(`${isCorrect ? "ঠিক!" : "এইটা না।"} ${oddRound.reveal}`);

    window.setTimeout(() => {
      const nextLevel = oddLevel + 1;
      setOddLevel(nextLevel);
      setOddRound(makeOddRound(nextLevel));
      setOddFeedback(null);
    }, 1000);
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Eye className="h-4 w-4" />
            Endless Visual Lab
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">কম text, অনেক round</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            visual memory, size instinct, আর odd-one-out সবগুলোই এখন endless level-based।
            level বাড়লে deck বড় হবে, clue mix বদলাবে, আর tap challenge দীর্ঘ হবে।
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(34,197,94,0.18),_rgba(59,130,246,0.16),_rgba(250,204,21,0.24))] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-100">
            <Trophy className="h-4 w-4" />
            Visual Session
          </p>
          <p className="mt-4 text-5xl font-black text-white">{totalVisualScore}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Memory</p>
              <p className="mt-2 text-2xl font-black text-white">L{memoryLevel}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Size</p>
              <p className="mt-2 text-2xl font-black text-white">L{sizeLevel}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Odd</p>
              <p className="mt-2 text-2xl font-black text-white">L{oddLevel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetVisualGames}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-950/35"
          >
            <RefreshCcw className="h-4 w-4" />
            visual session reset
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
                <BrainCircuit className="h-4 w-4" />
                Memory Grid
              </p>
              <h3 className="mt-3 text-2xl font-black">endless flip lab</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              lvl {memoryLevel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">level বাড়লে pair বাড়বে। এখন pair: {totalPairs}</p>
          <div className="mt-5 grid grid-cols-4 gap-3">
            {deck.map((card) => {
              const isVisible = flipped.includes(card.key) || matched.includes(card.id);

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => flipCard(card.key, card.id)}
                  className={`aspect-square rounded-[20px] border transition ${
                    isVisible
                      ? "border-cyan-300/40 bg-cyan-300/12"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <span className="flex h-full flex-col items-center justify-center gap-1">
                    <span className="text-2xl">{isVisible ? card.emoji : "❓"}</span>
                    <span className="text-[10px] uppercase tracking-[0.12em] text-slate-300">
                      {isVisible ? card.label : "flip"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            score {memoryScore} · best {memoryBest}
          </p>
        </article>

        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
                <Orbit className="h-4 w-4" />
                Size Instinct
              </p>
              <h3 className="mt-3 text-2xl font-black">{sizeRound.title}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              lvl {sizeLevel}
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {sizeRound.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseSizeItem(item.id)}
                className={`rounded-[24px] border p-4 transition ${
                  selectedSizes.includes(item.id)
                    ? "border-amber-300/40 bg-amber-300/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="flex flex-col items-center justify-center gap-3">
                  <span className={`rounded-full ${item.color}`} style={{ width: item.size, height: item.size }} />
                  <span className="text-xs uppercase tracking-[0.18em] text-slate-300">{item.label}</span>
                </span>
              </button>
            ))}
          </div>
          {selectedSizes.length > 0 ? (
            <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
              picked: {selectedSizes.length}/{sizeRound.items.length}
            </p>
          ) : null}
          {sizeFeedback ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              {sizeFeedback}
            </p>
          ) : null}
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            score {sizeScore} · best {sizeBest}
          </p>
        </article>

        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Odd One Out
              </p>
              <h3 className="mt-3 text-2xl font-black">visual weird detector</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              lvl {oddLevel}
            </span>
          </div>
          <p className="mt-3 text-sm text-slate-300">{oddRound.title}</p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {oddRound.options.map((option, index) => (
              <button
                key={`${oddRound.title}-${option}-${oddLevel}`}
                type="button"
                onClick={() => chooseOdd(index)}
                disabled={Boolean(oddFeedback)}
                className="aspect-square rounded-[24px] border border-white/10 bg-white/5 text-4xl transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-60"
              >
                {option}
              </button>
            ))}
          </div>
          {oddFeedback ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              {oddFeedback}
            </p>
          ) : null}
          <p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">
            score {oddScore} · best {oddBest}
          </p>
        </article>
      </div>
    </section>
  );
}
