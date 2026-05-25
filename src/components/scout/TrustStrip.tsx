"use client";

import { Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from "@mantine/core";
import { SiteGdsIcon } from "@/lib/siteGdsIcon";
import { useTrustPillars } from "@/hooks/useLocalizedSiteCopy";
import { MANTINE_PANEL_RADIUS } from "@/lib/gds/surfaceTokens";

export function TrustStrip() {
  const pillars = useTrustPillars();

  return (
    <Paper withBorder radius={MANTINE_PANEL_RADIUS} p="xl" mt="xl">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        {pillars.map((pillar) => (
          <Group key={pillar.title} align="flex-start" gap="sm" wrap="nowrap">
            <ThemeIcon size={40} radius="xl" variant="light" color="gray" aria-hidden>
              <SiteGdsIcon name={pillar.icon} />
            </ThemeIcon>
            <Stack gap={4}>
              <Text size="sm" fw={600} tt="uppercase" style={{ letterSpacing: "0.04em" }}>
                {pillar.title}
              </Text>
              <Text size="xs" c="dimmed" lh={1.5}>
                {pillar.desc}
              </Text>
            </Stack>
          </Group>
        ))}
      </SimpleGrid>
    </Paper>
  );
}
