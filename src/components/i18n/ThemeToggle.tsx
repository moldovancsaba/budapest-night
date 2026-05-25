"use client";

import { Box } from "@mantine/core";
import { ThemeToggle as GdsThemeToggle } from "@gds/core/client";

export function ThemeToggle({ className }: { className?: string }) {
  return (
    <Box className={className} component="span" display="inline-flex">
      <GdsThemeToggle size="lg" />
    </Box>
  );
}
