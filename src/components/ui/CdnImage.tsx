"use client";

import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useEffect, useMemo, useState } from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src?: string | null;
  /** When `src` is a site-relative path (starts with /), resolve against this origin (e.g. provider.website). */
  resolveBase?: string | null;
};

/** Renders an image with URL normalization, referrer policy for hotlinks, and a placeholder on missing/broken src. */
export function CdnImage({ src, resolveBase, className, alt, ...imgProps }: Props) {
  const resolved = useMemo(() => resolveImageUrl(src, resolveBase), [src, resolveBase]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-gradient-to-br from-[hsl(280_50%_12%)] via-card to-[hsl(260_50%_8%)] text-muted-foreground",
          className,
        )}
        aria-label={alt || "Image placeholder"}
      >
        <span className="px-2 text-center text-xs text-muted-foreground/80">Photo unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt ?? ""}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      {...imgProps}
    />
  );
}
