"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { articles as fallbackArticles, categories, type Article } from "@/lib/site-data";

const filters = ["সব", "বোরিং তথ্য বাদ দাও", "শুধু রহস্য দেখাও", "আজব", "বিজ্ঞান"];

export function ArchiveBrowser({ initialArticles }: { initialArticles?: Article[] }) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("সব");
  const articles = initialArticles?.length ? initialArticles : fallbackArticles;

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery =
        !query.trim() ||
        article.titleBn.toLowerCase().includes(query.toLowerCase()) ||
        article.teaser.toLowerCase().includes(query.toLowerCase()) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));

      const matchesFilter =
        activeFilter === "সব" ||
        (activeFilter === "শুধু রহস্য দেখাও" &&
          ["A", "B"].includes(article.categoryId)) ||
        (activeFilter === "বিজ্ঞান" && article.categoryId === "C") ||
        (activeFilter === "আজব" && ["A", "D"].includes(article.categoryId)) ||
        (activeFilter === "বোরিং তথ্য বাদ দাও" &&
          article.tags.some((tag) => ["mystery", "interactive", "future", "puzzle"].includes(tag)));

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, articles, query]);

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[32px] p-5 sm:p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">ম্যাজিক ফিল্টার</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-3 text-sm transition ${activeFilter === filter ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 bg-white/5 hover:border-cyan-300/40 hover:bg-cyan-300/10"}`}
            >
              {filter}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="শিরোনাম, tag, teaser দিয়ে খুঁজুন"
          className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition focus:border-cyan-300"
        />
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredArticles.map((article) => {
          const category = categories.find((item) => item.id === article.categoryId);

          return (
            <article key={article.slug} className="glass-panel rounded-[30px] p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">
                {article.id} · {category?.title}
              </p>
              <h2 className="mt-3 text-2xl font-bold">{article.titleBn}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{article.teaser}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {article.tags.map((tag, index) => (
                  <span key={`${article.slug}-${tag}-${index}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={`/articles/${article.slug}`}
                className="mt-5 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold transition hover:bg-white/15"
              >
                পড়তে ঢুকুন
              </Link>
            </article>
          );
        })}
      </section>
    </div>
  );
}
