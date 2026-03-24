import { ChatRoom } from "@/components/chat-room";
import { SiteShell } from "@/components/site-shell";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const params = await searchParams;

  return (
    <SiteShell eyebrow="" title="" description="">
      <ChatRoom initialRecipientUsername={params.to ?? ""} />
    </SiteShell>
  );
}
