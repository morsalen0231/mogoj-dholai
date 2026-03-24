"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Eraser, LogIn, MessageCircleWarning, RadioTower, RefreshCcw, SendHorizontal, UserRound } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import {
  type ChatInsertPayload,
  type ChatRecord,
  clearChatRoom,
  fetchChatMessages,
  fetchProfileByUsername,
  getSupabaseBrowserClient,
  insertChatMessage,
} from "@/lib/supabase";
import { roomSuggestions } from "@/lib/site-data";

function makeRoomId(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, "-");
}

function explainChatError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("sender_id") || normalized.includes("policy") || normalized.includes("row-level")) {
    return "Chat schema বা RLS পুরনো আছে। Supabase SQL Editor-এ latest `supabase/schema.sql` আবার run করুন।";
  }

  return message;
}

export function ChatRoom({ initialRecipientUsername = "" }: { initialRecipientUsername?: string }) {
  const { user, loading } = useAuth();
  const [roomInput, setRoomInput] = useState("obie-room");
  const [roomId, setRoomId] = useState("obie-room");
  const [recipientUsername, setRecipientUsername] = useState(initialRecipientUsername.replace(/^@/, ""));
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ChatRecord[]>([]);
  const [busy, setBusy] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split("@")[0] ||
    "গোপন যাত্রী";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;

    let active = true;

    void fetchChatMessages(roomId).then(({ data, error: fetchError }) => {
      if (!active) return;
      if (fetchError) {
        setError(explainChatError(fetchError.message));
      } else {
        setMessages(data ?? []);
      }
      setLoadingMessages(false);
    });

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: ChatInsertPayload) => {
          const next = payload.new;
          setMessages((current) => {
            const merged = [...current.filter((item) => item.id !== next.id), next];
            return merged.slice(-4);
          });
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [roomId, user]);

  const oldestAboutToVanish = useMemo(
    () => (messages.length >= 4 ? messages[0]?.id : null),
    [messages],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !text.trim()) return;

    setBusy(true);
    setError(null);

    const { error: insertError } = await insertChatMessage({
      room_id: roomId,
      sender_id: user.id,
      sender_name: displayName,
      message_text: text.trim(),
    });

    if (insertError) {
      setError(explainChatError(insertError.message));
    } else {
      setText("");
    }

    setBusy(false);
  }

  async function handleRoomSwitch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextRoom = makeRoomId(roomInput) || "obie-room";
    setLoadingMessages(true);
    setRoomId(nextRoom);
  }

  async function handleDirectRoom() {
    await openDirectRoom(recipientUsername);
  }

  async function openDirectRoom(rawRecipient: string) {
    if (!user) return;

    const cleanRecipient = rawRecipient.trim().replace(/^@/, "").toLowerCase();
    if (!cleanRecipient) {
      setError("যাকে message পাঠাতে চান, তার username দিন।");
      return;
    }

    const selfUsername =
      (user.user_metadata?.username as string | undefined)?.toLowerCase() ||
      user.email?.split("@")[0]?.toLowerCase() ||
      "";

    if (!selfUsername) {
      setError("আগে profile-এ username সেট করুন, তারপর direct chat খুলুন।");
      return;
    }

    const { data, error: profileError } = await fetchProfileByUsername(cleanRecipient);
    if (profileError || !data) {
      setError("ওই username-এর কোনো user profile পাওয়া যায়নি।");
      return;
    }

    const roomParts = [selfUsername, cleanRecipient].sort();
    const nextRoom = `dm-${roomParts.join("-")}`;
    setLoadingMessages(true);
    setRoomInput(nextRoom);
    setRoomId(nextRoom);
    setError(null);
  }

  useEffect(() => {
    if (!initialRecipientUsername || !user) return;
    const cleanRecipient = initialRecipientUsername.trim().replace(/^@/, "").toLowerCase();
    const selfUsername =
      (user.user_metadata?.username as string | undefined)?.toLowerCase() ||
      user.email?.split("@")[0]?.toLowerCase() ||
      "";

    if (!cleanRecipient || !selfUsername) return;

    let active = true;

    void fetchProfileByUsername(cleanRecipient).then(({ data, error: profileError }) => {
      if (!active) return;
      if (profileError || !data) {
        setError("ওই username-এর কোনো user profile পাওয়া যায়নি।");
        return;
      }

      const roomParts = [selfUsername, cleanRecipient].sort();
      const nextRoom = `dm-${roomParts.join("-")}`;
      setLoadingMessages(true);
      setRoomInput(nextRoom);
      setRoomId(nextRoom);
      setError(null);
    });

    return () => {
      active = false;
    };
  }, [initialRecipientUsername, user]);

  async function handleClearRoom() {
    setBusy(true);
    const { error: clearError } = await clearChatRoom(roomId);
    if (clearError) {
      setError(explainChatError(clearError.message));
    } else {
      setMessages([]);
    }
    setBusy(false);
  }

  if (loading) {
    return <div className="glass-panel rounded-[32px] p-6 text-slate-300">session দেখছি...</div>;
  }

  if (!user) {
    return (
      <div className="glass-panel rounded-[32px] p-6 text-slate-300">
        <p>real chat use করতে হলে আগে লগইন করতে হবে।</p>
        <Link href="/login" className="mt-5 inline-flex items-center gap-2 rounded-full bg-fuchsia-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-fuchsia-200">
          <LogIn className="h-4 w-4" />
          লগইন / সাইন আপ
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex w-full items-center gap-2 rounded-[28px] border border-red-400/30 bg-red-950/20 px-4 py-4 text-sm text-red-100 sm:px-5">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        সাবধান! এখানে দেয়ালেরও কান আছে, কিন্তু মেমোরি নেই!
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[32px] border border-white/10 bg-black/60 p-5 shadow-[0_0_60px_rgba(244,63,94,0.14)] sm:p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-fuchsia-200">
                <RadioTower className="h-4 w-4" />
                Invisible Chat
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">৪ মেসেজের বেশি স্মৃতি নেই</h2>
            </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <MessageCircleWarning className="h-4 w-4" />
                Room: {roomId}
              </div>
          </div>

          {loadingMessages ? (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              room messages লোড হচ্ছে...
            </div>
          ) : (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-400">
                  এই room এখন খালি। প্রথম message-টা আপনিই দিন।
                </div>
              ) : null}

              {messages.map((message, index) => {
                const willVanish = message.id === oldestAboutToVanish && index === 0;

                return (
                  <article
                    key={message.id}
                    className={`rounded-3xl border px-4 py-3 transition ${willVanish ? "border-amber-300/40 bg-amber-300/10 shadow-[0_0_30px_rgba(252,211,77,0.12)]" : "border-white/10 bg-white/5"}`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-400 sm:text-xs">
                      <span>{message.sender_name}</span>
                      <span>{willVanish ? "ধোঁয়া হওয়ার লাইনে" : new Date(message.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm leading-7 text-slate-100">{message.message_text}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div id="direct-message" className="rounded-[32px] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white">single message lane</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              কারও username দিলে তার সঙ্গে direct room বানানো যাবে। একই দুই username থেকে একই room code তৈরি হবে।
            </p>
            <label className="mt-4 block text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                recipient username
              </span>
              <input
                value={recipientUsername}
                onChange={(event) => setRecipientUsername(event.target.value)}
                placeholder="@username"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-fuchsia-300"
              />
            </label>
            <button
              type="button"
              onClick={handleDirectRoom}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200"
            >
              <UserRound className="h-4 w-4" />
              direct room খুলুন
            </button>
          </div>

          <form onSubmit={handleRoomSwitch} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white">রুম কন্ট্রোল</h3>
            <label className="mt-5 block text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <RadioTower className="h-4 w-4" />
                room code
              </span>
              <input
                value={roomInput}
                onChange={(event) => setRoomInput(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-fuchsia-300"
              />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-fuchsia-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-fuchsia-200">
                <RefreshCcw className="h-4 w-4" />
                room বদলান
              </button>
              <button type="button" onClick={handleClearRoom} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold transition hover:border-rose-300/40 hover:bg-rose-300/10 disabled:opacity-60">
                <Eraser className="h-4 w-4" />
                room খালি করুন
              </button>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {roomSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setRoomInput(suggestion);
                    setLoadingMessages(true);
                    setRoomId(suggestion);
                  }}
                  className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs uppercase tracking-[0.2em] text-slate-300 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-300/10"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </form>

          <form onSubmit={handleSubmit} className="rounded-[32px] border border-white/10 bg-slate-950/80 p-5 sm:p-6">
            <h3 className="text-xl font-bold text-white">নতুন মেসেজ</h3>
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
              <UserRound className="h-4 w-4" />
              Sender: {displayName}
            </div>
            <label className="mt-4 block text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <MessageCircleWarning className="h-4 w-4" />
                গোপন বার্তা
              </span>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-fuchsia-300"
              />
            </label>
            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-fuchsia-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-fuchsia-200 disabled:opacity-60"
            >
              <SendHorizontal className="h-4 w-4" />
              {busy ? "পাঠানো হচ্ছে..." : "টুইং পাঠান"}
            </button>
          </form>

          <div className="rounded-[32px] border border-white/10 bg-white/5 p-5 text-sm leading-7 text-slate-300 sm:p-6">
            <p className="font-semibold text-slate-100">Realtime + XP</p>
            <p className="mt-3">
              login user message পাঠালে Supabase realtime subscription সঙ্গে সঙ্গে সবাইকে দেখাবে,
              আর প্রতি message-এ profile-এ ৫ XP যোগ হবে।
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
