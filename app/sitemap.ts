import type { MetadataRoute } from "next";
import { articles as fallbackArticles } from "@/lib/site-data";
import { getSiteUrl } from "@/lib/site-url";
import { fetchPublicArticlesServer } from "@/lib/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { data: articleData } = await fetchPublicArticlesServer();
  const articles = articleData?.length ? articleData : fallbackArticles;

  const staticRoutes = [
    "",
    "/archive",
    "/community",
    "/games",
    "/leaderboard",
    "/share",
    "/write",
    "/login",
    "/feedback",
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "daily" : "weekly",
      priority: route === "" ? 1 : 0.7,
    })),
    ...articles.map((article) => ({
      url: `${siteUrl}/articles/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
