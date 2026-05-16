import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  logoUrl,
  size = 128,
  withWordmark = true,
  className = "",
}: {
  logoUrl?: string | null;
  size?: number;
  withWordmark?: boolean;
  className?: string;
}) {
  const hasUrl = Boolean(logoUrl?.trim());
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {hasUrl ? (
        <div
          className="relative shrink-0 overflow-hidden rounded-full ring-2 ring-accent/50"
          style={{ width: size, height: size }}
        >
          <Image src={logoUrl!} alt="Budapest Night logo" fill className="object-cover object-center" sizes={`${size}px`} />
        </div>
      ) : (
        <div
          className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-lg font-bold text-primary-foreground shadow-[0_0_20px_hsl(180_100%_50%_/_0.4)]"
          style={{ width: size, height: size }}
          aria-hidden
        >
          BN
        </div>
      )}
      {withWordmark && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-widest text-sidebar-foreground">Budapest</div>
          <div className="font-display text-[11px] font-semibold tracking-[0.35em] text-accent">NIGHT</div>
        </div>
      )}
    </div>
  );
}
