import { PublicPostsWall } from "@/components/public-posts-wall";
import { SiteShell } from "@/components/site-shell";

export default function CommunityPage() {
  return (
    <SiteShell eyebrow="" title="" description="">
      <main>
        <PublicPostsWall limit={40} variant="immersive" />
      </main>
    </SiteShell>
  );
}
