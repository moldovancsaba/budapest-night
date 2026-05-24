"use client";

import { Box, Text } from "@mantine/core";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useEffect, useMemo, useState } from "react";

/** Cover image with URL normalization (replaces CdnImage for profile heroes). */
export function ResolvedCoverImage({
  src,
  resolveBase,
  alt,
}: {
  src?: string | null;
  resolveBase?: string | null;
  alt: string;
}) {
  const resolved = useMemo(() => resolveImageUrl(src, resolveBase), [src, resolveBase]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <Box
        pos="absolute"
        inset={0}
        bg="gray.2"
        style={{ display: "grid", placeItems: "center" }}
        aria-label={alt || "Image placeholder"}
      >
        <Text size="xs" c="dimmed" ta="center" px="sm">
          Photo unavailable
        </Text>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={resolved}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setFailed(true)}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  );
}
