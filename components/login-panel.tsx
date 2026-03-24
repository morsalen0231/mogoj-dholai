"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createEmailVerificationToken, getSupabaseBrowserClient, upsertProfileRecord } from "@/lib/supabase";
import { checkRateLimit, formatResetTime } from "@/lib/auth-utils";
import { Chrome, Github } from "lucide-react";
export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("remembered_email") || "";
  });
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [rememberMe, setRememberMe] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(localStorage.getItem("remembered_email"));
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }
    // Rate limit check
    const rateLimitCheck = checkRateLimit(`login_${email}`);
    if (!rateLimitCheck.allowed) {
      const resetTime = formatResetTime(rateLimitCheck.resetIn);
      setError(`অনেক বেশি ব্যর্থ চেষ্টা। ${resetTime} পরে আবার চেষ্টা করুন।`);
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const normalizedEmail = email.trim().toLowerCase();
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            display_name: displayName.trim() || email.split("@")[0],
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setBusy(false);
        return;
      }

      if (!signUpData.user) {
        setError("signup সম্পন্ন হয়নি। আবার চেষ্টা করুন।");
        setBusy(false);
        return;
      }

      if (signUpData.user && Array.isArray(signUpData.user.identities) && signUpData.user.identities.length === 0) {
        setError("এই email আগে থেকেই ব্যবহার করা হয়েছে, অথবা pending account আছে। login করুন অথবা password reset ব্যবহার করুন।");
        setBusy(false);
        return;
      }

      if (!signUpData.session) {
        setError("Supabase dashboard-এ Confirm sign up এখনো ON আছে। এটা OFF না করলে custom verification flow চলবে না।");
        setBusy(false);
        return;
      }

      const finalName = displayName.trim() || normalizedEmail.split("@")[0];
      const { error: profileError } = await upsertProfileRecord({
        id: signUpData.user.id,
        session_id: signUpData.user.id,
        display_name: finalName,
        email: normalizedEmail,
        level: 1,
      });

      if (profileError) {
        setError(profileError.message);
        setBusy(false);
        return;
      }

      const { data: verificationToken, error: tokenError } = await createEmailVerificationToken(
        signUpData.user.id,
        normalizedEmail,
      );

      if (tokenError || !verificationToken) {
        setError(tokenError?.message || "verification token তৈরি করা যায়নি।");
        setBusy(false);
        return;
      }

      const verificationResponse = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          displayName: finalName,
          token: verificationToken,
        }),
      });

      const verificationPayload = (await verificationResponse.json().catch(() => null)) as
        | { message?: string; previewUrl?: string }
        | null;

      if (!verificationResponse.ok) {
        setError(verificationPayload?.message || "verification email পাঠানো যায়নি।");
        setBusy(false);
        return;
      }

      setMessage(
        verificationPayload?.previewUrl
          ? `অ্যাকাউন্ট তৈরি হয়েছে। SMTP configure না থাকায় dev verify link দেওয়া হয়েছে: ${verificationPayload.previewUrl}`
          : "অ্যাকাউন্ট তৈরি হয়েছে। verification email পাঠানো হয়েছে। Google user না হলে verify করার পর forgot password ব্যবহার করতে পারবেন।",
      );
      setMode("login");
      setBusy(false);
      return;
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError(
        loginError.message.toLowerCase().includes("email not confirmed")
          ? "এই project-এ Supabase dashboard থেকে email confirmation এখন forced আছে। optional করতে Authentication > Email এ confirm email setting বন্ধ করতে হবে।"
          : loginError.message,
      );
      setBusy(false);
      return;
    }

    // Save email if Remember Me is checked
    if (rememberMe) {
      localStorage.setItem("remembered_email", email);
    } else {
      localStorage.removeItem("remembered_email");
    }

    setBusy(false);
    router.push("/profile");
    router.refresh();
  }

  async function handleGoogleLogin() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (googleError) {
      setError(
        googleError.message.includes("provider is not enabled")
          ? "Google login চালাতে Supabase Authentication > Providers > Google enable করতে হবে, আর redirect URL-এ /auth/callback add করতে হবে।"
          : googleError.message,
      );
      setBusy(false);
      return;
    }
  }

  async function handleGitHubLogin() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }

    setBusy(true);
    setError(null);

    const { error: githubError } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (githubError) {
      setError(githubError.message);
      setBusy(false);
      return;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-panel rounded-[34px] p-7">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Access Panel</p>
        <h2 className="mt-3 text-3xl font-black">
          {mode === "login" ? "অ্যাকাউন্টে ঢুকুন" : "নতুন আঁতেল আইডি খুলুন"}
        </h2>
        <p className="mt-4 text-base leading-8 text-slate-300">
          login করলে profile, post submit, chat identity, আর future XP tracking আপনার account-এর
          সাথে বাঁধা থাকবে।
        </p>
        <div className="mt-6 inline-flex rounded-full border border-white/10 bg-slate-950/40 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm transition ${mode === "login" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}
          >
            লগইন
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm transition ${mode === "signup" ? "bg-amber-300 text-slate-950" : "text-slate-300"}`}
          >
            সাইন আপ
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="glass-panel rounded-[34px] p-7">
        {mode === "signup" ? (
          <label className="block text-sm text-slate-300">
            display name
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-amber-300"
            />
          </label>
        ) : null}

        <label className="mt-4 block text-sm text-slate-300">
          email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
          />
        </label>

        <label className="mt-4 block text-sm text-slate-300">
          password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
          />
        </label>

        {mode === "login" ? (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded"
            />
            <label htmlFor="remember-me" className="text-sm text-slate-400 cursor-pointer">
              আমাকে মনে রাখুন
            </label>
          </div>
        ) : null}

        {mode === "login" ? (
          <button
            type="button"
            onClick={() => router.push("/forget-password")}
            className="mt-2 text-xs text-cyan-300 hover:text-cyan-200"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </button>
        ) : null}

        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="mt-4 text-sm text-emerald-300">{message}</p> : null}
        {mode === "signup" ? (
          <p className="mt-4 text-xs leading-6 text-slate-400">
            verification optional রাখতে চাইলে Supabase Dashboard → Authentication → Email-এ `Confirm email`
            setting off রাখতে হবে। on থাকলে login-এর আগে verify লাগবে।
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-5 rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60 w-full"
        >
          {busy ? "অপেক্ষা করুন..." : mode === "login" ? "লগইন করুন" : "অ্যাকাউন্ট খুলুন"}
        </button>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            <Chrome size={18} />
            Google দিয়ে লগইন করুন
          </button>

          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
          >
            <Github size={18} />
            GitHub দিয়ে লগইন করুন
          </button>
        </div>
      </form>
    </div>
  );
}
