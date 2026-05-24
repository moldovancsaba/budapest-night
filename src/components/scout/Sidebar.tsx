"use client";

import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarRange,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  Palette,
  Heart,
  Calculator,
  Users,
  X,
  Home,
  UserCircle,
  Wine,
  Building2,
} from "lucide-react";
import {
  ActionIcon,
  Box,
  Group,
  Overlay,
  Paper,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import { Logo } from "./Logo";
import { AppButton } from "@/components/mantine/AppButton";
import type { Category } from "@/types/provider";

export type ViewKey =
  | Category
  | "Events"
  | "Saved"
  | "Calculator"
  | "Split Check"
  | "Meet-Up Groups"
  | "Home"
  | "Program"
  | "Eat & Drink"
  | "My Account";

type NavItem = {
  key: ViewKey;
  labelKey: string;
  icon: LucideIcon;
  disabled?: boolean;
};

const EXPLORE_ITEMS: NavItem[] = [
  { key: "Home", labelKey: "home", icon: Home },
  { key: "Program", labelKey: "program", icon: CalendarRange },
  { key: "Events", labelKey: "events", icon: CalendarDays },
  { key: "Venues", labelKey: "venues", icon: Building2 },
  { key: "Parties", labelKey: "parties", icon: PartyPopper },
  { key: "Restaurants", labelKey: "restaurants", icon: UtensilsCrossed },
  { key: "Cafés", labelKey: "cafes", icon: Coffee },
  { key: "Meet-Up Groups", labelKey: "culture", icon: Palette },
  { key: "Eat & Drink", labelKey: "eatDrink", icon: Wine },
];

const NIGHT_ITEMS: NavItem[] = [
  { key: "Saved", labelKey: "saved", icon: Heart },
  { key: "Calculator", labelKey: "budget", icon: Calculator },
  { key: "Split Check", labelKey: "split", icon: Users },
  { key: "My Account", labelKey: "myAccount", icon: UserCircle },
];

interface Props {
  active: ViewKey;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  logoUrl?: string | null;
  logoLightUrl?: string | null;
  sidebarPromo?: { title: string; body: string; cta: string };
}

export function Sidebar({
  active,
  mobileOpen,
  onCloseMobile,
  logoUrl,
  logoLightUrl,
  sidebarPromo,
}: Props) {
  const t = useTranslations("nav");
  const ts = useTranslations("sidebar");
  const desktop = useMediaQuery("(min-width: 75em)");

  const renderItems = (items: NavItem[]) =>
    items.map(({ key, labelKey, icon: Icon, disabled }) => (
      <Box key={key}>
        {disabled ? (
          <UnstyledButton
            type="button"
            disabled
            title={t("unavailable")}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 12,
              padding: "10px 12px",
              opacity: 0.45,
              cursor: "not-allowed",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <Icon size={16} />
            {t(labelKey)}
          </UnstyledButton>
        ) : (
          <UnstyledButton
            component={Link}
            href={buildPathForView(key)}
            onClick={onCloseMobile}
            aria-current={active === key ? "page" : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 14,
              fontWeight: 500,
              background: active === key ? "var(--mantine-color-brand-6)" : "transparent",
              color: active === key ? "var(--mantine-color-white)" : "var(--mantine-color-gray-3)",
            }}
          >
            <Icon size={16} />
            {t(labelKey)}
          </UnstyledButton>
        )}
      </Box>
    ));

  return (
    <>
      {!desktop && mobileOpen ? (
        <Overlay
          backgroundOpacity={0.45}
          onClick={onCloseMobile}
          zIndex={199}
          fixed
          aria-hidden
        />
      ) : null}
      <Stack
        h="100%"
        gap={0}
        bg="dark.8"
        style={{ borderRight: "1px solid var(--mantine-color-dark-4)" }}
      >
        <Group justify="space-between" p="lg">
          <Link
            href="/"
            onClick={onCloseMobile}
            aria-label={t("goHome")}
          >
            <Logo logoUrl={logoUrl} logoLightUrl={logoLightUrl} size={96} />
          </Link>
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={onCloseMobile}
            aria-label={t("closeMenu")}
            hiddenFrom="lg"
          >
            <X size={20} />
          </ActionIcon>
        </Group>

        <ScrollArea style={{ flex: 1, paddingInline: 16, paddingBottom: 8 }} aria-label="Main">
          <Text px="sm" pb={8} size="10px" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.2em" }}>
            {t("explore")}
          </Text>
          <Stack gap={4}>{renderItems(EXPLORE_ITEMS)}</Stack>

          <Text
            px="sm"
            pb={8}
            pt="xl"
            size="10px"
            fw={700}
            tt="uppercase"
            c="dimmed"
            style={{ letterSpacing: "0.2em" }}
          >
            {t("yourNight")}
          </Text>
          <Stack gap={4}>{renderItems(NIGHT_ITEMS)}</Stack>
        </ScrollArea>

        <Paper m="md" radius="xl" withBorder p="lg" bg="dark.6">
          <Text size="sm" fw={600}>
            {sidebarPromo?.title ?? ts("listVenueTitle")}
          </Text>
          <Text mt={4} size="xs" c="dimmed" lh={1.5}>
            {sidebarPromo?.body ?? ts("listVenueBody")}
          </Text>
          <AppButton
            size="sm"
            color="brand"
            fullWidth
            mt="md"
          >
            {sidebarPromo?.cta ?? ts("listVenueCta")}
          </AppButton>
        </Paper>
      </Stack>
    </>
  );
}
