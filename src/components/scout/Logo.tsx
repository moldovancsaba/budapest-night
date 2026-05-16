"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { isBundledBrandLogo, resolveThemeLogoUrl, type ThemeLogoUrls } from "@/config/brand";
import { useTranslations } from "next-intl";

export function Logo({
  logoUrl,
  logoLightUrl,
  size = 128,
  withWordmark = false,
  className = "",
}: ThemeLogoUrls & {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  const t = useTranslations("nav");
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const theme = mounted && resolvedTheme === "light" ? "light" : "dark";
  const src = resolveThemeLogoUrl(theme, { logoUrl, logoLightUrl });
  const isBundledLogo = isBundledBrandLogo(src);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden",
          isBundledLogo ? "rounded-lg bg-black" : "rounded-full bg-black ring-2 ring-border",
        )}
        style={{ width: size, height: size }}
      >
        <Image
          src={src}
          alt={t("brand")}
          fill
          className={cn(
            "object-center",
            isBundledLogo ? "object-contain p-1" : "object-cover",
          )}
          sizes={`${size}px`}
          priority={isBundledLogo}
        />
      </div>
      {withWordmark && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-widest text-sidebar-foreground">
            Budapest
          </div>
          <div className="font-display text-[11px] font-semibold tracking-[0.35em] text-brand">
            NIGHT
          </div>
        </div>
      )}
    </div>
  );
}
