import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateArticleDraft, slugify } from "@/lib/server/ai-article";

const CATEGORY_ROTATION = ["A", "B", "C", "D", "E"] as const;

type TrendItem = {
  title: string;
  link: string;
};

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseTrendItems(xml: string) {
  const items = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi));
  return items
    .map((match) => {
      const block = match[1];
      const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1];
      const link = block.match(/<link>([\s\S]*?)<\/link>/i)?.[1];

      if (!title) {
        return null;
      }

      return {
        title: decodeXml(title.trim()),
        link: decodeXml((link ?? "").trim()),
      } satisfies TrendItem;
    })
    .filter((item): item is TrendItem => Boolean(item?.title));
}

async function fetchTrendingTopics(geo: string) {
  const candidates = [
    `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}`,
    `https://trends.google.com/trending/rss?geo=${encodeURIComponent(geo)}&hl=en-US`,
    geo.toUpperCase() === "US" ? "https://www.google.com/trends/hottrends/atom/feed?pn=p1" : null,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        continue;
      }

      const xml = await response.text();
      const items = parseTrendItems(xml);
      if (items.length > 0) {
        return items;
      }
    } catch {
      continue;
    }
  }

  throw new Error("Google Trends RSS fetch করা যায়নি।");
}

function startOfUtcDay() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    geo?: string;
    limit?: number;
    maxDaily?: number;
    secret?: string;
  };

  const expectedSecret = process.env.AUTO_POST_SECRET;
  const providedSecret =
    request.headers.get("x-auto-post-secret") ?? body.secret ?? "";

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY বা URL পাওয়া যায়নি।" },
      { status: 500 },
    );
  }

  const geo = (body.geo ?? "US").trim().toUpperCase();
  const maxDaily = Math.min(Math.max(body.maxDaily ?? 10, 1), 10);
  const requestedLimit = Math.min(Math.max(body.limit ?? 5, 1), 10);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: existingArticles, error: existingError } = await supabase
    .from("articles")
    .select("id, slug, title_bn, created_at, image_url")
    .order("created_at", { ascending: false })
    .limit(500);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const todayStart = startOfUtcDay().toISOString();
  const aiTodayCount = (existingArticles ?? []).filter(
    (article) =>
      article.image_url === "/covers/ai-generated" &&
      article.created_at >= todayStart,
  ).length;

  const remainingToday = Math.max(0, maxDaily - aiTodayCount);
  const limit = Math.min(requestedLimit, remainingToday);

  if (limit <= 0) {
    return NextResponse.json({
      created: [],
      skipped: [],
      message: "আজকের AI auto-post limit পূর্ণ হয়েছে।",
    });
  }

  const existingSlugs = new Set(
    (existingArticles ?? [])
      .map((article) => article.slug?.toLowerCase())
      .filter(Boolean),
  );
  const existingTitles = new Set(
    (existingArticles ?? []).map((article) => article.title_bn.trim().toLowerCase()),
  );

  let trends: TrendItem[];
  try {
    trends = await fetchTrendingTopics(geo);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "trends fetch failed" },
      { status: 502 },
    );
  }

  const uniqueTrends = trends.filter((trend, index, source) => {
    const normalized = trend.title.trim().toLowerCase();
    return source.findIndex((item) => item.title.trim().toLowerCase() === normalized) === index;
  });

  const created: Array<{ title: string; slug: string }> = [];
  const skipped: Array<{ topic: string; reason: string }> = [];

  for (const [index, trend] of uniqueTrends.entries()) {
    if (created.length >= limit) {
      break;
    }

    const normalizedTopic = trend.title.trim().toLowerCase();
    const topicSlug = slugify(trend.title);

    if (existingTitles.has(normalizedTopic) || existingSlugs.has(topicSlug)) {
      skipped.push({ topic: trend.title, reason: "duplicate" });
      continue;
    }

    try {
      const categoryId = CATEGORY_ROTATION[index % CATEGORY_ROTATION.length];
      const draft = await generateArticleDraft({
        categoryId,
        topic: trend.title,
      });
      const finalSlug = slugify(draft.slug || trend.title);

      if (
        existingSlugs.has(finalSlug) ||
        existingTitles.has(draft.title_bn.trim().toLowerCase())
      ) {
        skipped.push({ topic: trend.title, reason: "duplicate-after-generate" });
        continue;
      }

      const { error } = await supabase.from("articles").insert({
        id: `${categoryId}-ai-${Date.now()}-${created.length}`,
        category_id: categoryId,
        profile_id: null,
        slug: finalSlug,
        title_bn: draft.title_bn,
        title_en: draft.title_en,
        cover_label: draft.cover_label,
        teaser: draft.teaser,
        content_standard: draft.content_standard,
        content_funny: draft.content_funny,
        fun_fact: draft.fun_fact,
        tags: draft.tags,
        image_url: "/covers/ai-generated",
        status: "approved",
        published_at: new Date().toISOString(),
      });

      if (error) {
        skipped.push({ topic: trend.title, reason: error.message });
        continue;
      }

      existingSlugs.add(finalSlug);
      existingTitles.add(draft.title_bn.trim().toLowerCase());
      created.push({ title: draft.title_bn, slug: finalSlug });
    } catch (error) {
      skipped.push({
        topic: trend.title,
        reason: error instanceof Error ? error.message : "generate failed",
      });
    }
  }

  return NextResponse.json({
    geo,
    requestedLimit,
    maxDaily,
    created,
    skipped,
  });
}
