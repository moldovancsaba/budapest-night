import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { DEFAULT_BRAIN } from "@/types/site";

const LOVABLE_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export async function POST(req: Request) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "LOVABLE_API_KEY is not set on the server. Add it in .env (never expose in NEXT_PUBLIC_)." },
      { status: 500 },
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const messages = body.messages ?? [];

  let system = DEFAULT_BRAIN.systemPrompt;
  let model = DEFAULT_BRAIN.model;
  const db = await getDb();
  if (db) {
    const doc = await db.collection(COL.brain).findOne({ _id: "main" } as never);
    if (doc) {
      if (typeof doc.systemPrompt === "string") system = doc.systemPrompt;
      if (typeof doc.model === "string" && doc.model) model = doc.model;
    }
  }

  const response = await fetch(LOVABLE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, ...messages],
      stream: true,
    }),
  });

  if (response.status === 429) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  if (response.status === 402) {
    return NextResponse.json({ error: "AI credits exhausted" }, { status: 402 });
  }
  if (!response.ok || !response.body) {
    const t = await response.text();
    console.error("brain gateway", response.status, t);
    return NextResponse.json({ error: "AI gateway error" }, { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
