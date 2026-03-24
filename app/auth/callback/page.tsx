"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    const code = searchParams.get("code");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      router.replace("/login?error=Supabase config পাওয়া যায়নি।");
      return;
    }
    const client = supabase;

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(errorDescription || error)}`);
      return;
    }

    let cancelled = false;

    async function finishOAuthLogin() {
      if (!code) {
        const { data } = await client.auth.getSession();

        if (cancelled) {
          return;
        }

        if (data.session) {
          router.replace("/profile");
          router.refresh();
          return;
        }

        router.replace(
          `/login?error=${encodeURIComponent(
            "OAuth callback-এ code বা session কোনোটাই আসেনি। Supabase Authentication > URL Configuration-এ Site URL আর Redirect URLs ঠিক আছে কি না দেখুন। Local হলে http://localhost:3000/auth/callback add করুন।",
          )}`,
        );
        return;
      }

      const { error: exchangeError } = await client.auth.exchangeCodeForSession(code);

      if (cancelled) {
        return;
      }

      if (exchangeError) {
        router.replace(`/login?error=${encodeURIComponent(exchangeError.message)}`);
        return;
      }

      router.replace("/profile");
      router.refresh();
    }

    finishOAuthLogin();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <SiteShell eyebrow="" title="" description="">
      <div className="glass-panel mx-auto max-w-xl rounded-[34px] p-7 text-sm leading-7 text-slate-300">
        যদি এখানে আটকে যায়, তাহলে `/login` পেজে ফিরে error message দেখুন। সাধারণত `Redirect URLs`
        mismatch হলেই callback-এ `code` আসে না।
      </div>
    </SiteShell>
  );
}
