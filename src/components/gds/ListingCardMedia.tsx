"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { Box } from "@mantine/core";

export function ListingCardMedia({
  src,
  alt,
  height = 176,
  sizes = "(max-width: 768px) 100vw, 33vw",
  overlays,
}: {
  src: string;
  alt: string;
  height?: number;
  sizes?: string;
  overlays?: ReactNode;
}) {
  return (
    <Box
      pos="relative"
      style={{
        height,
        overflow: "hidden",
        marginInline: "calc(-1 * var(--mantine-spacing-lg))",
        marginTop: "calc(-1 * var(--mantine-spacing-lg))",
        marginBottom: 0,
      }}
    >
      <Image fill src={src} alt={alt} style={{ objectFit: "cover" }} sizes={sizes} />
      {overlays}
    </Box>
  );
}
