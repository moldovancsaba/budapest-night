"use client";

import { Box, Text } from "@mantine/core";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import { useEffect, useMemo, useState } from "react";

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  resolveBase?: string | null;
  fill?: boolean;
};

export function CdnImage({ src, resolveBase, alt, fill, style, ...imgProps }: Props) {
  const resolved = useMemo(() => resolveImageUrl(src, resolveBase), [src, resolveBase]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  if (!resolved || failed) {
    return (
      <Box
        pos={fill ? "absolute" : "relative"}
        inset={fill ? 0 : undefined}
        w={fill ? "100%" : undefined}
        h={fill ? "100%" : undefined}
        bg="gray.2"
        style={{ display: "grid", placeItems: "center", ...style }}
        aria-label={alt || "Image placeholder"}
      >
        <Text size="xs" c="dimmed" ta="center" px="xs">
          Photo unavailable
        </Text>
      </Box>
    );
  }

  return (
    <Box
      component="img"
      src={resolved}
      alt={alt ?? ""}
      pos={fill ? "absolute" : "relative"}
      inset={fill ? 0 : undefined}
      w={fill ? "100%" : "100%"}
      h={fill ? "100%" : "auto"}
      style={{ objectFit: "cover", objectPosition: "center", display: "block", ...style }}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      {...imgProps}
    />
  );
}
