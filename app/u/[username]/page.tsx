import { PublicProfilePanel } from "@/components/public-profile-panel";
import { SiteShell } from "@/components/site-shell";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  return (
    <SiteShell
      eyebrow=""
      title=""
      description=""
    >
      <PublicProfilePanel username={username} />
    </SiteShell>
  );
}
