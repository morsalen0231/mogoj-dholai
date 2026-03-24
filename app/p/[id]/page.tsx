import { PublicProfilePanel } from "@/components/public-profile-panel";
import { SiteShell } from "@/components/site-shell";

export default async function PublicProfileByIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <SiteShell
      eyebrow=""
      title=""
      description=""
    >
      <PublicProfilePanel profileId={id} />
    </SiteShell>
  );
}
