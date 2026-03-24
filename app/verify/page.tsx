"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MailWarning } from "lucide-react";
import { SiteShell } from "@/components/site-shell";
import { verifyEmailToken } from "@/lib/supabase";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("verification check হচ্ছে...");

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    void verifyEmailToken(token).then(({ data, error }) => {
      if (!active) return;

      if (error || !data) {
        setStatus("error");
        setMessage(error?.message || "token invalid বা expired।");
        return;
      }

      setStatus("success");
      setMessage("email verify হয়েছে। এখন login করতে পারবেন, আর forgot password-ও কাজ করবে।");
      window.setTimeout(() => {
        router.replace("/login");
      }, 1500);
    });

    return () => {
      active = false;
    };
  }, [router, token]);

  const resolvedStatus = token ? status : "error";
  const resolvedMessage = token ? message : "verification token পাওয়া যায়নি।";

  return (
    <SiteShell eyebrow="" title="" description="">
      <div className="mx-auto max-w-xl">
        <div className="glass-panel rounded-[34px] p-7 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
            {resolvedStatus === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            ) : (
              <MailWarning className="h-8 w-8 text-amber-300" />
            )}
          </div>
          <p className="mt-5 text-base text-slate-200">{resolvedMessage}</p>
          {resolvedStatus === "error" ? (
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              login page
            </Link>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}
