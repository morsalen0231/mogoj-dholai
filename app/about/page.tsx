import { SiteShell } from "@/components/site-shell";
import { officeLaws } from "@/lib/site-data";

const team = [
  "ইনি আমাদের কোডিং ওস্তাদ, দিনে ২ লিটার কফি আর ৩টা বাগ খেয়ে বেঁচে থাকেন।",
  "ইনি কনটেন্ট কেমিস্ট, boring fact-কে viral curiosity-তে রূপ দেন।",
  "ইনি UI-র ফকির, gradient না দিলে ঘুম আসে না।",
];

export default function AboutPage() {
  return (
    <SiteShell eyebrow="" title="" description="">
      <main className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="glass-panel rounded-[34px] p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Mission</p>
          <p className="mt-4 text-base leading-8 text-slate-300">আমরা চাই knowledge page মানেই যেন textbook boredom না হয়। তাই playful copy, layered layout, interactive route, আর temporary chat-কে একসাথে এনে এই project দাঁড় করানো হয়েছে।</p>
        </section>
        <section className="glass-panel rounded-[34px] p-7">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Team Bios</p>
          <div className="mt-5 space-y-3">
            {team.map((member) => (
              <div key={member} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                {member}
              </div>
            ))}
          </div>
        </section>
        <section className="glass-panel rounded-[34px] p-7 lg:col-span-2">
          <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-200">Office Laws</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {officeLaws.map((law) => (
              <div key={law} className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300">
                {law}
              </div>
            ))}
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
