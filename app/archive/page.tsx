import { ArchiveBrowser } from "@/components/archive-browser";
import { SiteShell } from "@/components/site-shell";
import { fetchPublicArticlesServer } from "@/lib/supabase";

export default async function ArchivePage() {
  const { data: articleData } = await fetchPublicArticlesServer();

  return (
    <SiteShell eyebrow="" title="" description="">
      <main>
        <ArchiveBrowser initialArticles={articleData ?? undefined} />
      </main>
    </SiteShell>
  );
}
