"use client";

import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useEffect, useMemo, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  /** When `src` is a site-relative path (starts with /), resolve against this origin (e.g. provider.website). */
  resolveBase?: string | null;
  /**
   * Fill the nearest `position: relative` + `overflow: hidden` ancestor (absolute inset-0).
   * Use for card heroes and gallery slots.
   */
  fill?: boolean;
};

const COVER_IMG =
  "block max-h-none max-w-none object-cover object-center [object-fit:cover]";

/** Renders an image with URL normalization, referrer policy for hotlinks, and a placeholder on missing/broken src. */
export function CdnImage({ src, resolveBase, className, alt, fill, style, ...imgProps }: Props) {
  const resolved = useMemo(() => resolveImageUrl(src, resolveBase), [src, resolveBase]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <div
        className={cn(
          "grid place-items-center bg-muted text-muted-foreground",
          fill && "absolute inset-0 size-full",
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
      className={cn(COVER_IMG, fill ? "absolute inset-0 size-full" : "size-full", className)}
      style={{ objectFit: "cover", objectPosition: "center", ...style }}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      {...imgProps}
    />
  );
}
