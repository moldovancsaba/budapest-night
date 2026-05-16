/** Square brand mark for dark UI (also `src/app/icon.png` for favicon). */
export const APP_LOGO_PATH = "/images/logo.png";

/** EST mark on black square — used in light mode. */
export const APP_LOGO_LIGHT_PATH = "/images/logo-light.png";

export const APP_FAVICON = {
  icon: APP_LOGO_PATH,
  apple: APP_LOGO_PATH,
  shortcut: APP_LOGO_PATH,
} as const;

export type ThemeLogoUrls = {
  logoUrl?: string | null;
  logoLightUrl?: string | null;
};

/** CMS override or bundled default logo for UI. */
export function resolveLogoUrl(logoUrl?: string | null, fallback: string = APP_LOGO_PATH): string {
  const trimmed = logoUrl?.trim();
  return trimmed || fallback;
}

function bakedLogoLightUrl(): string {
  const raw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_IMG_BB_LOGO_LIGHT?.trim() : "";
  return raw || APP_LOGO_LIGHT_PATH;
}

/** Pick logo src for light vs dark theme. */
export function resolveThemeLogoUrl(
  theme: "light" | "dark",
  urls: ThemeLogoUrls = {},
): string {
  if (theme === "light") {
    const trimmed = urls.logoLightUrl?.trim();
    if (trimmed) return trimmed;
    return bakedLogoLightUrl();
  }
  return resolveLogoUrl(urls.logoUrl, APP_LOGO_PATH);
}

export function isBundledBrandLogo(src: string): boolean {
  return src === APP_LOGO_PATH || src === APP_LOGO_LIGHT_PATH;
}

export function isLocalBrandAsset(url: string): boolean {
  return url.startsWith("/");
}
