import { NextResponse } from "next/server";
import { brainChatCompletionsUrl, resolveBrainOpenAIKey } from "@/lib/brain/openaiChat";
import { checkBrainChatRateLimit, clientIpFromRequest } from "@/lib/brainChatRateLimit";
import { getDb, COL } from "@/lib/mongodb";
import { DEFAULT_BRAIN } from "@/types/site";

export async function POST(req: Request) {
  const db = await getDb();
  if (db) {
    const ip = clientIpFromRequest(req);
    const limited = await checkBrainChatRateLimit(db, ip);
    if (limited.allowed === false) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }
  }

  const key = resolveBrainOpenAIKey();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "BRAIN_OPENAI_API_KEY (or CURATOR_OPENAI_API_KEY) is not set on the server. Add it in .env (never expose in NEXT_PUBLIC_).",
      },
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
  if (db) {
    const doc = await db.collection(COL.brain).findOne({ _id: "main" } as never);
    if (doc) {
      if (typeof doc.systemPrompt === "string") system = doc.systemPrompt;
      if (typeof doc.model === "string" && doc.model) model = doc.model;
    }
  }

  const response = await fetch(brainChatCompletionsUrl(), {
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
    console.error("brain chat", response.status, t);
    return NextResponse.json({ error: "AI chat error" }, { status: 502 });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
