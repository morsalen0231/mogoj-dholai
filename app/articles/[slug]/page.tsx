import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AgeSwitch } from "@/components/age-switch";
import { SiteShell } from "@/components/site-shell";
import { articles as fallbackArticles, getArticleBySlug, getCategoryById } from "@/lib/site-data";
import { getSiteUrl } from "@/lib/site-url";
import { fetchPublicArticleBySlugServer, fetchPublicArticlesServer } from "@/lib/supabase";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { data } = await fetchPublicArticlesServer();
  const source = data?.length ? data : fallbackArticles;
  return source.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: dbArticle } = await fetchPublicArticleBySlugServer(slug);
  const article = dbArticle ?? getArticleBySlug(slug);
  if (!article) return {};
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/articles/${article.slug}`;

  return {
    title: article.titleBn,
    description: article.teaser,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: article.titleBn,
      description: article.teaser,
      locale: "bn_BD",
      siteName: "রহস্যঘর",
    },
    twitter: {
      card: "summary_large_image",
      title: article.titleBn,
      description: article.teaser,
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const { data: dbArticle } = await fetchPublicArticleBySlugServer(slug);
  const article = dbArticle ?? getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategoryById(article.categoryId);
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/articles/${article.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titleBn,
    description: article.teaser,
    inLanguage: "bn-BD",
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Organization",
      name: "রহস্যঘর",
    },
    publisher: {
      "@type": "Organization",
      name: "রহস্যঘর",
    },
    articleSection: category?.title ?? "ক্যাটাগরি",
    keywords: article.tags.join(", "),
  };

  return (
    <SiteShell eyebrow="" title="" description="">
      <main className="space-y-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,_rgba(34,211,238,0.22),_rgba(45,212,191,0.18),_rgba(14,165,233,0.1))] p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.22),_transparent_20%),radial-gradient(circle_at_80%_30%,_rgba(250,204,21,0.18),_transparent_16%),linear-gradient(180deg,_transparent,_rgba(2,6,23,0.34))]" />
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-100">Animated Cover</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">{article.coverLabel}</h2>
              <div className="mt-8 grid grid-cols-3 gap-3">
                {article.tags.map((tag, index) => (
                  <div key={`${article.slug}-${tag}-${index}`} className="floaty rounded-3xl border border-white/10 bg-white/10 px-4 py-6 text-center text-sm uppercase tracking-[0.2em] text-slate-100">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <aside className="glass-panel rounded-[36px] p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-200">Funny Fact Box</p>
            <p className="mt-4 text-lg leading-8 text-slate-100">{article.funFact}</p>
          </aside>
        </section>
        <AgeSwitch standard={article.contentStandard} funny={article.contentFunny} />
        <section className="glass-panel rounded-[32px] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Next Jumps</p>
              <h2 className="mt-2 text-2xl font-bold">আরও rabbit hole</h2>
            </div>
            <Link href="/archive" className="rounded-full bg-cyan-300 px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-200">
              সব article দেখুন
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
