import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_LOGO_PATH, resolveLogoUrl } from "@/config/brand";
import { useTranslations } from "next-intl";

export function Logo({
  logoUrl,
  size = 128,
  withWordmark = false,
  className = "",
}: {
  logoUrl?: string | null;
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  const t = useTranslations("nav");
  const src = resolveLogoUrl(logoUrl);
  const isBundledLogo = src === APP_LOGO_PATH;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative shrink-0 overflow-hidden bg-black",
          isBundledLogo ? "rounded-lg" : "rounded-full ring-2 ring-border",
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
          <div className="font-display text-[11px] font-semibold tracking-[0.35em] text-primary">
            NIGHT
          </div>
        </div>
      )}
    </div>
  );
}
