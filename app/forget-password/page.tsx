"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { canRequestPasswordReset, getSupabaseBrowserClient } from "@/lib/supabase";
import { SiteShell } from "@/components/site-shell";
import { Mail, KeyRound } from "lucide-react";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const [stage, setStage] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const { data: canReset, error: eligibilityError } = await canRequestPasswordReset(email);
    if (eligibilityError) {
      setError(eligibilityError.message);
      setBusy(false);
      return;
    }

    if (!canReset) {
      setError("এই email এখনো verify করা হয়নি। verify করা account-ই শুধু password reset করতে পারবে।");
      setBusy(false);
      return;
    }

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forget-password`,
    });

    if (resetError) {
      setError(resetError.message);
      setBusy(false);
      return;
    }

    setMessage(`✅ Password reset link আপনার ${email} এ পাঠানো হয়েছে। Email check করুন এবং নতুন password সেট করুন।`);
    setStage("reset");
    setBusy(false);
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setError("Supabase config পাওয়া যায়নি।");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("দুটি password match করছে না।");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password কমপক্ষে ৬ অক্ষর হতে হবে।");
      return;
    }

    setBusy(true);
    setError(null);
    setMessage(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setBusy(false);
      return;
    }

    setMessage("✅ Password সফলভাবে পরিবর্তন করা হয়েছেছে। এখন login করুন।");
    setTimeout(() => {
      router.push("/login");
    }, 2000);
    setBusy(false);
  }

  return (
    <SiteShell eyebrow="" title="" description="">
      <div className="mx-auto max-w-md">
        <div className="glass-panel rounded-[34px] p-7">
          {stage === "email" ? (
            <form onSubmit={handleRequestReset} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300">
                  <Mail className="mb-2 inline" size={16} /> আপনার Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
                />
              </div>

              {error && <p className="text-sm text-rose-300">❌ {error}</p>}
              {message && <p className="text-sm text-emerald-300">{message}</p>}
              <p className="text-xs leading-6 text-slate-400">
                Email verification optional. তবে verified email-ই শুধু password reset link পাবে।
              </p>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:opacity-60"
              >
                {busy ? "অপেক্ষা করুন..." : "Reset Link পাঠান"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-sm text-slate-400 hover:text-slate-300"
              >
                ← Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-sm text-slate-300">
                  <KeyRound className="mb-2 inline" size={16} /> নতুন Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300">
                  <KeyRound className="mb-2 inline" size={16} /> Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none focus:border-cyan-300"
                />
              </div>

              {error && <p className="text-sm text-rose-300">❌ {error}</p>}
              {message && <p className="text-sm text-emerald-300">{message}</p>}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-emerald-300 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-200 disabled:opacity-60"
              >
                {busy ? "অপেক্ষা করুন..." : "Password পরিবর্তন করুন"}
              </button>
            </form>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
