import { NextResponse } from "next/server";
import { generateArticleDraft } from "@/lib/server/ai-article";

type GeneratePayload = {
  categoryId?: string;
  topic?: string;
};

export async function POST(request: Request) {
  let payload: GeneratePayload;

  try {
    payload = (await request.json()) as GeneratePayload;
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const topic = payload.topic?.trim();
  const categoryId = payload.categoryId?.trim() || "A";

  if (!topic) {
    return NextResponse.json({ error: "topic লাগবে।" }, { status: 400 });
  }

  try {
    const article = await generateArticleDraft({ categoryId, topic });
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI draft generate failed" },
      { status: 502 },
    );
  }
}
