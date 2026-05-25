"use client";

import { Box, ThemeIcon } from "@mantine/core";
import { FeatureBand } from "@/components/gds";
import { SiteGdsIcon } from "@/lib/siteGdsIcon";
import { useTrustPillars } from "@/hooks/useLocalizedSiteCopy";

export function TrustStrip() {
  const pillars = useTrustPillars();

  return (
    <Box mt="xl">
      <FeatureBand
        columns={3}
        bordered
        items={pillars.map((pillar) => ({
          id: pillar.title,
          title: pillar.title,
          description: pillar.desc,
          icon: (
            <ThemeIcon size={40} radius="xl" variant="light" color="gray" aria-hidden>
              <SiteGdsIcon name={pillar.icon} />
            </ThemeIcon>
          ),
        }))}
      />
    </Box>
  );
}
