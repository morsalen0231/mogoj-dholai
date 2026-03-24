type GenerateArticleInput = {
  categoryId: string;
  topic: string;
};

function normalizeRawContent(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJsonBlock(value: string) {
  const start = value.indexOf("{");
  const end = value.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return value.slice(start, end + 1);
}

function parseArticlePayload(rawContent: string) {
  const normalized = normalizeRawContent(rawContent);
  const attempts = [
    normalized,
    extractJsonBlock(normalized),
    extractJsonBlock(rawContent),
  ].filter(Boolean) as string[];

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractStringField(source: string, key: string) {
  const pattern = new RegExp(`"${key}"\\s*:\\s*"([^"]*)`, "i");
  const match = source.match(pattern);
  return match?.[1]?.trim() ?? "";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildFallbackArticle(rawContent: string, topic: string) {
  const normalized = normalizeRawContent(rawContent);
  const titleBn = extractStringField(normalized, "title_bn") || topic;
  const titleEn = extractStringField(normalized, "title_en") || topic;
  const teaser =
    extractStringField(normalized, "teaser") ||
    `${topic} নিয়ে সংক্ষিপ্ত, সহজ আর কৌতূহলজাগানো একটি লেখা।`;
  const coverLabel = extractStringField(normalized, "cover_label") || titleBn;
  const funFact =
    extractStringField(normalized, "fun_fact") ||
    `${topic} নিয়ে এখনো অনেক মানুষের আগ্রহ আছে।`;
  const tags =
    extractStringField(normalized, "tags") || "fact, mystery, update";
  const slug = slugify(extractStringField(normalized, "slug") || titleBn);

  return {
    title_bn: titleBn,
    title_en: titleEn,
    slug,
    cover_label: coverLabel,
    teaser,
    content_standard: [
      `${topic} এখন অনেকের আলোচনার বিষয়, কারণ এটি শুধু একটি খবর বা ট্রেন্ড না, বরং প্রযুক্তি, বাস্তব ব্যবহার, অর্থনীতি, আর ভবিষ্যৎ জীবনযাত্রার সাথে সরাসরি জড়িত। অনেক মানুষ প্রথমে এই ধরনের বিষয়কে শুধু exciting innovation হিসেবে দেখে, কিন্তু একটু গভীরে গেলে বোঝা যায় এর পেছনে অবকাঠামো, নীতি, খরচ, ব্যবহারকারীর অভ্যাস, আর বাস্তব সুবিধা-অসুবিধার জটিল দিকও আছে। তাই ${topic} বুঝতে হলে কেবল headline নয়, বরং এর কাজের ধরন, মানুষের প্রয়োজন, আর বাস্তব মাঠপর্যায়ের প্রভাব একসাথে দেখতে হয়।`,
      `বাংলাদেশের প্রেক্ষাপটে ${topic} নিয়ে আগ্রহের কারণ আরও আলাদা। এখানে শহর, জেলা, আর প্রত্যন্ত অঞ্চলের বাস্তব চাহিদা এক নয়। কোথাও মানুষ speed চায়, কোথাও reliability, আবার কোথাও access-টাই সবচেয়ে বড় বিষয়। যদি ${topic} এমন কোনো সমাধান দেয় যা existing limitation কমাতে পারে, তাহলে এটি বড় পরিবর্তনের সম্ভাবনা তৈরি করতে পারে। কিন্তু একই সঙ্গে প্রশ্ন থাকে, খরচ কত হবে, সাধারণ মানুষ কি সহজে ব্যবহার করতে পারবে, setup কতটা সহজ হবে, এবং service quality সব এলাকায় সমান থাকবে কি না। এই practical প্রশ্নগুলোর উত্তরই শেষ পর্যন্ত ঠিক করবে বিষয়টি hype হয়ে থাকবে, নাকি সত্যিই everyday life-এ impact ফেলবে।`,
      `${topic} নিয়ে আরেকটি গুরুত্বপূর্ণ দিক হলো perception আর reality-এর পার্থক্য। online discussion-এ অনেক সময় কোনো নতুন বিষয়কে এমনভাবে দেখা হয় যেন এটি একাই সব সমস্যা সমাধান করে ফেলবে। বাস্তবে প্রায় সব technology-র মতো এখানেও trade-off থাকে। কোনো সমাধান speed বাড়াতে পারে, কিন্তু cost বাড়তে পারে। কোনো option accessibility দিতে পারে, কিন্তু maintenance বা long-term sustainability নিয়ে প্রশ্ন তুলতে পারে। তাই ${topic} মূল্যায়ন করতে হলে শুধু excitement নয়, বরং comparison, user experience, support system, আর long-term viability-ও বিবেচনায় রাখতে হয়।`,
      `ভবিষ্যতের দিক থেকে দেখলে ${topic} সম্ভাবনাময়, কারণ এটি নতুন সুযোগ তৈরি করতে পারে শিক্ষা, যোগাযোগ, ব্যবসা, entertainment, বা remote access-এর ক্ষেত্রে। তবে সম্ভাবনা আর বাস্তব সাফল্য এক জিনিস নয়। কোনো প্রযুক্তি বা ব্যবস্থা তখনই meaningful হয়, যখন তা মানুষের জন্য understandable, affordable, আর dependable হয়। সেই দিক থেকে ${topic} নিয়ে আগ্রহ থাকা স্বাভাবিক, কিন্তু সবচেয়ে দরকার balanced expectation। hype থাকুক, curiosity থাকুক, কিন্তু তার সঙ্গে বাস্তব হিসাবও থাকা দরকার। তাহলে বিষয়টি শুধু আলোচনায় সীমাবদ্ধ থাকবে না, বরং সত্যিকারের value তৈরি করতে পারবে।`,
    ].join("\n\n"),
    content_funny: [
      `${topic} নিয়ে online এ যে পরিমাণ excitement দেখা যায়, তাতে মনে হয় যেন কাল সকালেই সবাই sci-fi movie-র ভিতরে ঘুম থেকে উঠবে। কিন্তু বাস্তবতা হচ্ছে, নতুন জিনিস যত futuristic-ই লাগুক, শেষ পর্যন্ত সবাই আগে দেখে এটা আসলে কাজের কি না।`,
      `সোজা কথা, ${topic} দেখতে impressive হতে পারে, discussion-এ trendও হতে পারে, কিন্তু average user-এর মাথায় ঘোরে একটাই combo question: speed কেমন, setup কেমন, আর pocket কাঁদবে নাকি হাসবে।`,
    ].join("\n\n"),
    fun_fact: funFact,
    tags,
    image_url: "/covers/ai-generated",
  };
}

export async function generateArticleDraft({
  categoryId,
  topic,
}: GenerateArticleInput) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("GROQ_API_KEY পাওয়া যায়নি।");
  }

  const prompt = `
You are generating one playful Bengali knowledge-hub article draft.
Return one compact JSON object only. No markdown. No explanation.

Required JSON shape:
{
  "title_bn": "string",
  "title_en": "string",
  "slug": "string",
  "cover_label": "string",
  "teaser": "string",
  "content_standard": "paragraph 1\\n\\nparagraph 2\\n\\nparagraph 3\\n\\nparagraph 4",
  "content_funny": "paragraph 1\\n\\nparagraph 2",
  "fun_fact": "string",
  "tags": "tag1, tag2, tag3",
  "image_url": "/covers/ai-generated"
}

Rules:
- Topic: ${topic}
- Category ID: ${categoryId}
- Write natural Bengali for title_bn, teaser, cover_label, content_standard, content_funny, fun_fact.
- title_en must be short English.
- content_standard must be exactly 4 paragraphs and at least 400 words total.
- content_funny must be exactly 2 short paragraphs.
- tags must be comma-separated and short.
- slug must be lowercase English slug.
- No extra keys.
- Keep teaser concise, but make content_standard rich and informative.
`.trim();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      max_tokens: 1400,
      messages: [
        {
          role: "system",
          content: "Return a compact valid JSON object only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const rawContent = data.choices?.[0]?.message?.content?.trim();
  if (!rawContent) {
    throw new Error("Groq response empty এসেছে।");
  }

  const article = parseArticlePayload(rawContent) ?? buildFallbackArticle(rawContent, topic);
  const titleBn = String(article.title_bn ?? topic).trim();
  const titleEn = String(article.title_en ?? topic).trim();
  const slug = slugify(String(article.slug ?? titleBn).trim() || titleBn);

  return {
    title_bn: titleBn,
    title_en: titleEn,
    slug,
    cover_label: String(article.cover_label ?? titleBn).trim(),
    teaser: String(article.teaser ?? "").trim(),
    content_standard: String(article.content_standard ?? "").trim(),
    content_funny: String(article.content_funny ?? "").trim(),
    fun_fact: String(article.fun_fact ?? "").trim(),
    tags: String(article.tags ?? "").trim(),
    image_url: String(article.image_url ?? "/covers/ai-generated").trim(),
  };
}
