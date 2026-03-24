"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoginPanel } from "@/components/login-panel";
import { SiteShell } from "@/components/site-shell";
import { loginPerks } from "@/lib/site-data";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  return (
    <SiteShell eyebrow="" title="" description="">
      <div className="space-y-6">
        {errorMessage && (
          <div className="glass-panel rounded-[28px] border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-300">
            ❌ {decodeURIComponent(errorMessage)}
          </div>
        )}
        <LoginPanel />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loginPerks.map((perk) => (
            <div key={perk} className="glass-panel rounded-[28px] p-5 text-sm leading-7 text-slate-300">
              {perk}
            </div>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
