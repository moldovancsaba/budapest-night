const STORAGE_KEY = "pestiest_attribution";

export type StoredAttribution = {
  source: string;
  medium: string;
  content?: string;
  campaign?: string;
  capturedAt: string;
};

/** Persist QR / UTM params for the session (client-only). */
export function persistAttributionFromSearch(search: URLSearchParams): void {
  if (typeof window === "undefined") return;
  const medium = search.get("utm_medium");
  const src = search.get("src");
  if (medium !== "qr" && src !== "qr") return;
  const payload: StoredAttribution = {
    source: search.get("utm_source") ?? "pestiest",
    medium: "qr",
    content: search.get("utm_content") ?? undefined,
    campaign: search.get("utm_campaign") ?? undefined,
    capturedAt: new Date().toISOString(),
  };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readStoredAttribution(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredAttribution;
  } catch {
    return null;
  }
}
