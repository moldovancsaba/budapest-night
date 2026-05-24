"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import {
  MapPin,
  Martini,
  Music2,
  Sparkles,
  ArrowRight,
  Home,
} from "lucide-react";
import { Box, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";

export type NotFoundCopy = {
  code: string;
  headline: string;
  subtitle: string;
  line1: string;
  line2: string;
  excusesTitle: string;
  excuses: string[];
  ctaHome: string;
  ctaEvents: string;
  statLabel: string;
  statValue: string;
};

type PageLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  [key: string]: unknown;
};

export function NotFoundPage({
  copy,
  LinkComponent,
}: {
  copy: NotFoundCopy;
  LinkComponent: ComponentType<PageLinkProps>;
}) {
  const Link = LinkComponent;
  const [excuseIdx, setExcuseIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const excuseTimer = setInterval(() => {
      setExcuseIdx((i) => (i + 1) % copy.excuses.length);
    }, 3200);
    const glitchTimer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4000);
    return () => {
      clearInterval(excuseTimer);
      clearInterval(glitchTimer);
    };
  }, [copy.excuses.length]);

  return (
    <Box
      pos="relative"
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        padding: "4rem 1rem",
      }}
    >
      <Box
        pos="absolute"
        left="8%"
        top="18%"
        c="dimmed"
        opacity={0.2}
        style={{ pointerEvents: "none" }}
      >
        <Martini size={64} />
      </Box>
      <Box
        pos="absolute"
        right="10%"
        top="22%"
        c="dimmed"
        opacity={0.25}
        style={{ pointerEvents: "none" }}
      >
        <Music2 size={56} />
      </Box>
      <Box
        pos="absolute"
        bottom="20%"
        left="12%"
        c="dimmed"
        opacity={0.2}
        style={{ pointerEvents: "none" }}
      >
        <MapPin size={48} />
      </Box>

      <Paper
        withBorder
        radius="xl"
        p={{ base: "xl", sm: 48 }}
        maw={672}
        w="100%"
        ta="center"
        style={{
          position: "relative",
          zIndex: 10,
          transform: glitch ? "translateX(2px) skewX(1deg)" : undefined,
          transition: "transform 120ms ease",
        }}
      >
        <Group justify="center" gap="xs" mb="md">
          <Sparkles size={14} />
          <Text size="xs" fw={600} tt="uppercase" lts="0.35em" c="dimmed">
            {copy.subtitle}
          </Text>
          <Sparkles size={14} />
        </Group>

        <Title
          order={1}
          style={{
            fontSize: "clamp(5rem, 22vw, 9rem)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
          aria-hidden
        >
          {copy.code}
        </Title>

        <Title order={2} size="h2" mt="sm">
          {copy.headline}
        </Title>
        <Text size="sm" c="dimmed" mt="md" lh={1.6}>
          {copy.line1}
        </Text>
        <Text size="sm" c="dimmed" fs="italic" mt="xs">
          {copy.line2}
        </Text>

        <Paper withBorder radius="xl" p="md" mt="xl" mx="auto" maw={420}>
          <Text size="xs" fw={600} tt="uppercase" lts="0.2em" c="dimmed">
            {copy.excusesTitle}
          </Text>
          <Text key={excuseIdx} size="md" fw={600} mt="sm" mih={40}>
            “{copy.excuses[excuseIdx] ?? "…"}”
          </Text>
        </Paper>

        <Group justify="center" gap="sm" mt="lg">
          <Text size="xs" c="dimmed">
            {copy.statLabel}
          </Text>
          <Text
            size="xs"
            fw={700}
            ff="monospace"
            px="sm"
            py={2}
            style={{ borderRadius: 9999, background: "var(--mantine-color-gray-light)" }}
          >
            {copy.statValue}
          </Text>
        </Group>

        <Stack gap="sm" mt="xl" align="center" maw={280} w="100%">
          <Link href="/">
            <AppButton component="span" size="lg" radius="xl" w="100%">
              <Group gap="xs" wrap="nowrap" justify="center">
                <Home size={16} />
                {copy.ctaHome}
              </Group>
            </AppButton>
          </Link>
          <Link href="/events">
            <AppButton component="span" size="lg" variant="outline" radius="xl" w="100%">
              <Group gap="xs" wrap="nowrap" justify="center">
                {copy.ctaEvents}
                <ArrowRight size={16} />
              </Group>
            </AppButton>
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
}
