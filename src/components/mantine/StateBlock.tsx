"use client";

import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { LucideIcon } from "lucide-react";

export type StateBlockProps = {
  title: string;
  message: string;
  icon?: LucideIcon;
};

/** GDS state-block contract — empty, error, and informational placeholders. */
export function StateBlock({ title, message, icon: Icon }: StateBlockProps) {
  return (
    <Paper
      withBorder
      radius="xl"
      p="xl"
      style={{ borderStyle: "dashed" }}
      role="status"
      aria-live="polite"
    >
      <Stack align="center" gap="sm" ta="center" maw={420} mx="auto">
        {Icon ? (
          <ThemeIcon size={56} radius="xl" variant="light" color="gray" aria-hidden>
            <Icon size={24} strokeWidth={1.75} />
          </ThemeIcon>
        ) : null}
        <Title order={3} size="h4" tt="uppercase" lts="0.04em">
          {title}
        </Title>
        <Text size="sm" c="dimmed">
          {message}
        </Text>
      </Stack>
    </Paper>
  );
}
