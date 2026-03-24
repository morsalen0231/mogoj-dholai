"use client";

import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Brain,
  CheckCircle2,
  Flame,
  Gamepad2,
  RefreshCcw,
  Sparkles,
  Swords,
  TimerReset,
  Trophy,
  XCircle,
} from "lucide-react";
import { mythGameQuestions, oddFactRounds } from "@/lib/site-data";

type TimelineEvent = {
  label: string;
  year: number;
};

const timelinePool: TimelineEvent[] = [
  { label: "স্পুটনিক-১ কক্ষপথে যায়", year: 1957 },
  { label: "মানুষ প্রথম চাঁদে নামে", year: 1969 },
  { label: "বাংলাদেশ স্বাধীন হয়", year: 1971 },
  { label: "হাবল টেলিস্কোপ launch হয়", year: 1990 },
  { label: "প্রথম ব্ল্যাক হোল image প্রকাশিত হয়", year: 2019 },
  { label: "টাইটানিক ডুবে যায়", year: 1912 },
  { label: "দ্বিতীয় বিশ্বযুদ্ধ শুরু", year: 1939 },
  { label: "রাডার যুদ্ধকৌশল বদলায়", year: 1940 },
  { label: "ইন্টারনেট public era শুরু", year: 1990 },
  { label: "CRISPR জনপ্রিয় হয়", year: 2012 },
  { label: "প্রথম iPhone আসে", year: 2007 },
  { label: "ওয়েব public use-এ যায়", year: 1991 },
];

function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

function sampleWithoutReplacement<T>(items: T[], count: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, count);
}

function makeTimelineRound(level: number) {
  const itemCount = Math.min(4 + Math.floor(level / 2), 6);
  const sampled = sampleWithoutReplacement(timelinePool, itemCount);

  return {
    title: `টাইমলাইন লেভেল ${level}`,
    intro: `সবচেয়ে পুরনো থেকে নতুন ক্রমে সাজান। level ${level}-এ আইটেম: ${itemCount}টি`,
    items: [...sampled].sort(() => Math.random() - 0.5),
  };
}

function makeOddRound(round: number) {
  const source = pickRandom(oddFactRounds);
  const options =
    round % 3 === 0
      ? [...source.options].sort(() => Math.random() - 0.5)
      : source.options;
  const correctText = source.options[source.correctIndex];
  const remappedIndex = options.findIndex((option) => option === correctText);

  return {
    prompt: source.prompt,
    options,
    correctIndex: remappedIndex,
    explanation: source.explanation,
  };
}

export function GameArcade() {
  const [mythRound, setMythRound] = useState(1);
  const [mythQuestion, setMythQuestion] = useState(() => pickRandom(mythGameQuestions));
  const [mythScore, setMythScore] = useState(0);
  const [mythStreak, setMythStreak] = useState(0);
  const [mythBest, setMythBest] = useState(0);
  const [mythFeedback, setMythFeedback] = useState<string | null>(null);

  const [timelineLevel, setTimelineLevel] = useState(1);
  const [timelineRound, setTimelineRound] = useState(1);
  const [timelineData, setTimelineData] = useState(() => makeTimelineRound(1));
  const [timelineFeedback, setTimelineFeedback] = useState<string | null>(null);
  const [timelineScore, setTimelineScore] = useState(0);
  const [timelineStreak, setTimelineStreak] = useState(0);
  const [timelineBest, setTimelineBest] = useState(0);

  const [oddRound, setOddRound] = useState(1);
  const [oddData, setOddData] = useState(() => makeOddRound(1));
  const [oddScore, setOddScore] = useState(0);
  const [oddStreak, setOddStreak] = useState(0);
  const [oddBest, setOddBest] = useState(0);
  const [oddFeedback, setOddFeedback] = useState<string | null>(null);

  const totalScore = useMemo(() => mythScore + timelineScore + oddScore, [mythScore, timelineScore, oddScore]);

  function handleMythAnswer(choice: boolean) {
    if (mythFeedback) return;

    const isCorrect = choice === mythQuestion.answer;
    const nextStreak = isCorrect ? mythStreak + 1 : 0;
    setMythScore((current) => current + (isCorrect ? 1 : 0));
    setMythStreak(nextStreak);
    setMythBest((current) => Math.max(current, nextStreak));
    setMythFeedback(`${isCorrect ? "ঠিক ধরেছেন।" : "এইবার brain একটু স্লিপ করল।"} ${mythQuestion.explanation}`);

    window.setTimeout(() => {
      setMythRound((current) => current + 1);
      setMythQuestion(pickRandom(mythGameQuestions));
      setMythFeedback(null);
    }, 1100);
  }

  function moveTimelineItem(index: number, direction: "up" | "down") {
    if (timelineFeedback) return;

    setTimelineData((current) => {
      const nextItems = [...current.items];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextItems.length) return current;
      [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
      return { ...current, items: nextItems };
    });
  }

  function submitTimeline() {
    if (timelineFeedback) return;

    const correct = timelineData.items.every((item, index, array) => {
      if (index === 0) return true;
      return array[index - 1].year <= item.year;
    });

    if (correct) {
      const nextScore = timelineScore + 1;
      const nextStreak = timelineStreak + 1;
      const nextLevel = 1 + Math.floor(nextScore / 2);

      setTimelineScore(nextScore);
      setTimelineStreak(nextStreak);
      setTimelineBest((current) => Math.max(current, nextStreak));
      setTimelineLevel(nextLevel);
      setTimelineFeedback("দারুণ। timeline perfectly গুছিয়েছেন। এবার আরও বড় round আসছে।");

      window.setTimeout(() => {
        const nextRound = timelineRound + 1;
        setTimelineRound(nextRound);
        setTimelineData(makeTimelineRound(nextLevel));
        setTimelineFeedback(null);
      }, 1200);
      return;
    }

    setTimelineStreak(0);
    setTimelineFeedback("ক্রমটা এখনও উল্টাপাল্টা। ছোট বছর আগে যাবে। আরেকবার shuffle না করে চিন্তা করুন।");
  }

  function resetTimelineRound() {
    setTimelineData(makeTimelineRound(timelineLevel));
    setTimelineFeedback(null);
  }

  function chooseOddFact(index: number) {
    if (oddFeedback) return;

    const isCorrect = index === oddData.correctIndex;
    const nextStreak = isCorrect ? oddStreak + 1 : 0;
    setOddScore((current) => current + (isCorrect ? 1 : 0));
    setOddStreak(nextStreak);
    setOddBest((current) => Math.max(current, nextStreak));
    setOddFeedback(`${isCorrect ? "বাহ, আজব সত্য ধরেছেন।" : "এইটা fake direction-এ চলে গেছে।"} ${oddData.explanation}`);

    window.setTimeout(() => {
      const nextRound = oddRound + 1;
      setOddRound(nextRound);
      setOddData(makeOddRound(nextRound));
      setOddFeedback(null);
    }, 1100);
  }

  function resetArcade() {
    setMythRound(1);
    setMythQuestion(pickRandom(mythGameQuestions));
    setMythScore(0);
    setMythStreak(0);
    setMythBest(0);
    setMythFeedback(null);

    setTimelineLevel(1);
    setTimelineRound(1);
    setTimelineData(makeTimelineRound(1));
    setTimelineFeedback(null);
    setTimelineScore(0);
    setTimelineStreak(0);
    setTimelineBest(0);

    setOddRound(1);
    setOddData(makeOddRound(1));
    setOddScore(0);
    setOddStreak(0);
    setOddBest(0);
    setOddFeedback(null);
  }

  return (
    <main className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-panel rounded-[32px] p-5 sm:p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Gamepad2 className="h-4 w-4" />
            Endless Brain Arcade
          </p>
          <h2 className="mt-3 text-3xl font-black sm:text-4xl">শেষ হবে না, শুধু harder হবে</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
            finite quiz বাদ। এখন myth, timeline, আর odd-fact challenge সবগুলো random round,
            streak, level, আর session score দিয়ে endless হয়ে গেছে।
          </p>
        </div>
        <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,_rgba(14,165,233,0.22),_rgba(236,72,153,0.2),_rgba(250,204,21,0.24))] p-5 sm:p-7">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-slate-100">
            <Trophy className="h-4 w-4" />
            Session Score
          </p>
          <p className="mt-4 text-5xl font-black text-white">{totalScore}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Myth Best</p>
              <p className="mt-2 text-2xl font-black text-white">{mythBest}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Timeline Best</p>
              <p className="mt-2 text-2xl font-black text-white">{timelineBest}</p>
            </div>
            <div className="rounded-[22px] bg-slate-950/25 p-3">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-200/80">Odd Best</p>
              <p className="mt-2 text-2xl font-black text-white">{oddBest}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetArcade}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-950/35"
          >
            <RefreshCcw className="h-4 w-4" />
            endless session reset
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
                <Swords className="h-4 w-4" />
                Myth Smash
              </p>
              <h3 className="mt-3 text-2xl font-black">endless myth duel</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              round {mythRound}
            </span>
          </div>
          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">streak {mythStreak}</p>
            <p className="mt-3 text-base leading-8 text-slate-100">{mythQuestion.statement}</p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleMythAnswer(true)}
              disabled={Boolean(mythFeedback)}
              className="rounded-2xl bg-emerald-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
            >
              সত্যি
            </button>
            <button
              type="button"
              onClick={() => handleMythAnswer(false)}
              disabled={Boolean(mythFeedback)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:border-rose-300/40 hover:bg-rose-300/10 disabled:opacity-60"
            >
              মিথ্যা
            </button>
          </div>
          {mythFeedback ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              {mythFeedback}
            </p>
          ) : null}
        </article>

        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-amber-200">
                <TimerReset className="h-4 w-4" />
                Timeline Fixer
              </p>
              <h3 className="mt-3 text-2xl font-black">{timelineData.title}</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              lvl {timelineLevel}
            </span>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-300">{timelineData.intro}</p>
          <div className="mt-5 space-y-3">
            {timelineData.items.map((item, index) => (
              <div key={`${item.label}-${item.year}`} className="rounded-[24px] border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-7 text-slate-100">{item.label}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveTimelineItem(index, "up")}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs font-semibold"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                    উপরে
                  </button>
                  <button
                    type="button"
                    onClick={() => moveTimelineItem(index, "down")}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1.5 text-xs font-semibold"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                    নিচে
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={submitTimeline}
              disabled={Boolean(timelineFeedback)}
              className="rounded-2xl bg-amber-300 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-200 disabled:opacity-60"
            >
              জমা দিন
            </button>
            <button
              type="button"
              onClick={resetTimelineRound}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold transition hover:border-white/20 hover:bg-white/10"
            >
              reshuffle
            </button>
          </div>
          {timelineFeedback ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
              {timelineFeedback}
            </p>
          ) : null}
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-slate-400">
            streak {timelineStreak} · score {timelineScore} · round {timelineRound}
          </p>
        </article>

        <article className="glass-panel rounded-[32px] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
                <Brain className="h-4 w-4" />
                Odd But True
              </p>
              <h3 className="mt-3 text-2xl font-black">random weird detector</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              round {oddRound}
            </span>
          </div>
          <div className="mt-5 rounded-[26px] border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">streak {oddStreak}</p>
            <p className="mt-3 text-base leading-8 text-slate-100">{oddData.prompt}</p>
          </div>
          <div className="mt-5 space-y-3">
            {oddData.options.map((option, index) => (
              <button
                key={`${oddRound}-${option}`}
                type="button"
                onClick={() => chooseOddFact(index)}
                disabled={Boolean(oddFeedback)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-7 text-slate-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 disabled:opacity-60"
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
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-emerald-200">
            <Flame className="h-4 w-4" />
            Endless Rule
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            wrong answer মানে game over না। streak reset হবে, কিন্তু round চলতেই থাকবে। তাই যত খুশি চালিয়ে যেতে পারবেন।
          </p>
        </div>
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
            {totalScore >= 12 ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            Brain Status
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {totalScore >= 12
              ? "আজ আপনি long-session mode-এ আছেন। brain আর ego দুটোই confident।"
              : "warm-up হয়েছে। আরও ১০-১৫ round খেললে মগজ পুরো turbo-তে যাবে।"}
          </p>
        </div>
        <div className="glass-panel rounded-[32px] p-5 sm:p-6">
          <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-cyan-200">
            <Sparkles className="h-4 w-4" />
            Long Play Tip
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            timeline-এ level যত বাড়বে, item তত বাড়বে। myth আর odd round-এ question random ঘুরবে, তাই session naturally দীর্ঘ হবে।
          </p>
        </div>
      </section>
    </main>
  );
}
