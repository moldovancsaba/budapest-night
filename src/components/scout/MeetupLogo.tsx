import type { CSSProperties } from "react";
import { Baby, Building2, Heart, Coffee, Blocks, Users } from "lucide-react";
import { Box, Text } from "@mantine/core";
import type { MeetupGroup } from "@/types/meetup";

const ICONS = {
  stroller: Baby,
  skyline: Building2,
  heart: Heart,
  coffee: Coffee,
  playground: Blocks,
  community: Users,
} as const;

const PALETTES: Record<
  MeetupGroup["palette"],
  { container: CSSProperties; iconColor: string; badge: CSSProperties }
> = {
  teal: {
    container: { backgroundColor: "var(--mantine-color-gray-1)" },
    iconColor: "var(--mantine-color-text)",
    badge: {
      backgroundColor: "var(--mantine-color-text)",
      color: "var(--mantine-color-body)",
    },
  },
  orange: {
    container: { backgroundColor: "var(--mantine-color-gray-1)" },
    iconColor: "var(--mantine-color-text)",
    badge: {
      backgroundColor: "var(--mantine-color-text)",
      color: "var(--mantine-color-body)",
    },
  },
  beige: {
    container: { backgroundColor: "var(--mantine-color-gray-2)" },
    iconColor: "var(--mantine-color-text)",
    badge: {
      backgroundColor: "var(--mantine-color-text)",
      color: "var(--mantine-color-body)",
    },
  },
  charcoal: {
    container: { backgroundColor: "var(--mantine-color-text)" },
    iconColor: "var(--mantine-color-body)",
    badge: {
      backgroundColor: "var(--mantine-color-default)",
      color: "var(--mantine-color-text)",
    },
  },
};

const SIZES = {
  md: { box: 56, icon: 20, badge: 24, badgeFont: 10 },
  lg: { box: 80, icon: 28, badge: 32, badgeFont: 12 },
} as const;

export function MeetupLogo({
  group,
  size = "md",
}: {
  group: MeetupGroup;
  size?: "md" | "lg";
}) {
  const Icon = ICONS[group.icon];
  const p = PALETTES[group.palette];
  const dim = SIZES[size];

  return (
    <Box
      style={{
        position: "relative",
        display: "grid",
        placeItems: "center",
        width: dim.box,
        height: dim.box,
        borderRadius: "50%",
        border: "1px solid var(--mantine-color-default-border)",
        ...p.container,
      }}
    >
      <Icon size={dim.icon} color={p.iconColor} strokeWidth={1.75} aria-hidden />
      <Text
        component="span"
        ff="var(--mantine-font-family-headings)"
        fw={700}
        fz={dim.badgeFont}
        style={{
          position: "absolute",
          bottom: -4,
          right: -4,
          display: "grid",
          placeItems: "center",
          width: dim.badge,
          height: dim.badge,
          borderRadius: "50%",
          ...p.badge,
        }}
      >
        {group.initials}
      </Text>
    </Box>
  );
}
