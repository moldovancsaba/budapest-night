/** Canonical provider badge → `badge.*` message key. */
export const BADGE_KEY: Record<string, string> = {
  Featured: "featured",
  Popular: "popular",
  New: "new",
  "Staff Pick": "staffPick",
  "Hidden Gem": "hiddenGem",
  "Weekend Vibes": "weekendVibes",
};

export function badgeMessageKey(canonical: string): string | undefined {
  return BADGE_KEY[canonical];
}
