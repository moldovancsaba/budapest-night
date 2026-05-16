import type { Db } from "mongodb";

const COLLECTION = "rateLimitBuckets";
const WINDOW_MS = 60_000;
const DEFAULT_MAX_PER_WINDOW = 20;

function maxPerWindow(): number {
  const n = Number(process.env.BRAIN_CHAT_RATE_LIMIT_PER_MIN ?? DEFAULT_MAX_PER_WINDOW);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 120) : DEFAULT_MAX_PER_WINDOW;
}

export function clientIpFromRequest(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = req.headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

/** Mongo-backed sliding window — works across serverless instances. */
export async function checkBrainChatRateLimit(
  db: Db,
  clientKey: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterSec: number }> {
  const now = Date.now();
  const bucketId = `brain-chat:${clientKey}`;
  const col = db.collection(COLLECTION);
  const max = maxPerWindow();

  const existing = (await col.findOne({ _id: bucketId } as never)) as unknown as {
    _id: string;
    count: number;
    windowStart: number;
  } | null;

  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    await col.updateOne(
      { _id: bucketId } as never,
      { $set: { count: 1, windowStart: now } },
      { upsert: true },
    );
    return { allowed: true };
  }

  if (existing.count >= max) {
    const retryAfterSec = Math.ceil((WINDOW_MS - (now - existing.windowStart)) / 1000);
    return { allowed: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  await col.updateOne({ _id: bucketId } as never, { $inc: { count: 1 } });
  return { allowed: true };
}
