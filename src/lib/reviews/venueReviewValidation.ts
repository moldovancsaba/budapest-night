const REVIEWER_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;

export function isValidReviewerId(value: string): boolean {
  return REVIEWER_ID_RE.test(value);
}

export function sanitizeDisplayName(value: string): string {
  const t = value.replace(/[\x00-\x1f]/g, "").trim().slice(0, 40);
  return t || "Night owl";
}

export function sanitizeReviewBody(value: string): string {
  return value.replace(/[\x00-\x1f]/g, "").trim().slice(0, 500);
}

export function parseReviewRating(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const r = Math.round(n);
  if (r < 1 || r > 5) return null;
  return r;
}
