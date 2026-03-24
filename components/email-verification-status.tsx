"use client";

import { Mail, MailCheck } from "lucide-react";

interface EmailVerificationStatusProps {
  email: string;
  isVerified: boolean | undefined;
}

export function EmailVerificationStatus({ email, isVerified }: EmailVerificationStatusProps) {
  if (typeof isVerified === "undefined") {
    return null;
  }

  if (isVerified) {
    return (
      <div className="glass-panel rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 flex items-center gap-3">
        <MailCheck size={20} className="text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">✅ Email Verified</p>
          <p className="text-xs text-emerald-200">{email}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Mail size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-300">📬 Email Verification Pending</p>
            <p className="text-xs text-amber-200">{email}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-amber-200 leading-relaxed">
        আমরা একটি verification email পাঠিয়েছি। Inbox এবং Spam ফোল্ডার দেখে নিন। Link টি click করে email verify করুন।
      </p>
    </div>
  );
}
