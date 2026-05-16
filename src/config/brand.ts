/** Square brand mark in `public/images/logo.png` (also `src/app/icon.png` for favicon). */
export const APP_LOGO_PATH = "/images/logo.png";

export const APP_FAVICON = {
  icon: APP_LOGO_PATH,
  apple: APP_LOGO_PATH,
  shortcut: APP_LOGO_PATH,
} as const;

/** CMS override or bundled default logo for UI. */
export function resolveLogoUrl(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim();
  return trimmed || APP_LOGO_PATH;
}

export function isLocalBrandAsset(url: string): boolean {
  return url.startsWith("/");
}
