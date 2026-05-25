"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Search, Sparkles, Wine } from "@/components/gds/icons";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { Link } from "@/i18n/routing";
import { menuBoardTagsForKind, menuTagMessageKey, type MenuTag } from "@/data/menuTags";
import { TOUR_TEMPLATES } from "@/data/tourTemplates";
import { buildTourPath } from "@/lib/appPaths";
import { useFormatMenuPrice } from "@/hooks/useFormatMenuPrice";
import type { PublicMenuItemRow } from "@/lib/publicMenuItem";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { AppButton } from "@/components/gds/AppButton";
import {
  Box,
  Chip,
  Group,
  Loader,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";

interface Props {
  onOpen: (p: Provider) => void;
}

export function EatDrinkView({ onOpen }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("eatDrink");
  const tTag = useTranslations("menuTag");
  const formatPrice = useFormatMenuPrice();
  const { data: providers = [] } = useProvidersCatalog();

  const [items, setItems] = useState<PublicMenuItemRow[]>([]);
  const [total, setTotal] = useState(0);
  const [providersWithMenu, setProvidersWithMenu] = useState(0);
  const [tourReadiness, setTourReadiness] = useState<
    Record<string, { eligible: number; ready: boolean; stopCount: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<MenuTag | null>(null);
  const [kind, setKind] = useState<"food" | "drink" | null>(null);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");

  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(tmr);
  }, [q]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tag) params.set("tag", tag);
      if (kind) params.set("kind", kind);
      if (debouncedQ) params.set("q", debouncedQ);
      params.set("limit", "80");
      params.set("locale", locale);
      const res = await fetch(`/api/public/menu-items?${params.toString()}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
      setProvidersWithMenu(data.providersWithMenu ?? 0);
      setTourReadiness(data.tourReadiness ?? {});
    } catch {
      setItems([]);
      setTotal(0);
      setProvidersWithMenu(0);
      setTourReadiness({});
    } finally {
      setLoading(false);
    }
  }, [tag, kind, debouncedQ, locale]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const boardTags = useMemo(() => menuBoardTagsForKind(kind), [kind]);

  useEffect(() => {
    if (!tag) return;
    if (!boardTags.includes(tag)) setTag(null);
  }, [tag, boardTags]);

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  const openRow = (row: PublicMenuItemRow) => {
    const p = providerById.get(row.providerId);
    if (p) onOpen(p);
  };

  const itemKindLabel = (kind: PublicMenuItemRow["kind"]) => {
    if (kind === "food") return t("itemKind.food");
    if (kind === "drink") return t("itemKind.drink");
    return t("itemKind.other");
  };

  return (
    <Stack gap="xl">
      <Paper radius="xl" withBorder p={{ base: "xl", sm: 40 }} pos="relative" style={{ overflow: "hidden" }}>
        <Stack gap="sm" maw={640} style={{ position: "relative", zIndex: 1 }}>
          <Group gap="xs">
            <Wine size={16} />
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
              {t("eyebrow")}
            </Text>
          </Group>
          <Title order={1} size="h2" tt="uppercase" lts="0.02em">
            {t("title")}
          </Title>
          <Text size="sm" c="dimmed" lh={1.6}>
            {t("subtitle")}
          </Text>
        </Stack>
        <Sparkles
          size={128}
          style={{
            position: "absolute",
            right: -16,
            top: 16,
            opacity: 0.12,
            pointerEvents: "none",
          }}
          aria-hidden
        />
      </Paper>

      <Stack gap="md">
        <Title order={2} size="h4" tt="uppercase" lts="0.04em">
          {t("toursTitle")}
        </Title>
        <Text size="sm" c="dimmed">
          {t("toursSubtitle")}
          {!loading && providersWithMenu > 0 ? (
            <Text component="span" display="block" mt={4}>
              {t("venuesWithMenus", { count: providersWithMenu })}
            </Text>
          ) : null}
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          {TOUR_TEMPLATES.map((tpl) => {
            const readiness = tourReadiness[tpl.id];
            const ready = readiness?.ready ?? false;
            const inner = (
              <Stack gap="xs">
                <Text fw={600} size="md">
                  {t(`tours.${tpl.id}.title`)}
                </Text>
                <Text size="xs" c="dimmed" lh={1.5}>
                  {t(`tours.${tpl.id}.description`)}
                </Text>
                <Text size="xs" c="dimmed">
                  {ready
                    ? t("tourReady", { count: readiness?.eligible ?? 0 })
                    : t("tourNeedsMenus", {
                        eligible: readiness?.eligible ?? 0,
                        required: readiness?.stopCount ?? tpl.stopCount,
                      })}
                </Text>
                {ready ? (
                  <Text size="xs" fw={500} mt="xs">
                    {t("startTour")} →
                  </Text>
                ) : null}
              </Stack>
            );
            return ready ? (
              <Paper
                key={tpl.id}
                component={Link}
                href={buildTourPath(tpl.id)}
                radius="xl"
                withBorder
                p="lg"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {inner}
              </Paper>
            ) : (
              <Paper
                key={tpl.id}
                radius="xl"
                withBorder
                p="lg"
                style={{ opacity: 0.8, borderStyle: "dashed" }}
              >
                {inner}
              </Paper>
            );
          })}
        </SimpleGrid>
      </Stack>

      <Stack gap="md">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Stack gap={4}>
            <Title order={2} size="h4" tt="uppercase" lts="0.04em">
              {t("browseTitle")}
            </Title>
            <Text size="sm" c="dimmed">
              {loading ? t("loading") : t("resultsCount", { shown: items.length, total })}
            </Text>
          </Stack>
          <TextInput
            value={q}
            onChange={(e) => setQ(e.currentTarget.value)}
            placeholder={t("searchPlaceholder")}
            leftSection={<Search size={16} />}
            maw={320}
            style={{ flex: 1, minWidth: 200 }}
            radius="xl"
          />
        </Group>

        <Group gap="xs">
          <AppButton
            size="sm"
            variant={kind === null ? "default" : "outline"}
            radius="xl"
            onClick={() => {
              setKind(null);
              setTag(null);
            }}
          >
            {t("filterAll")}
          </AppButton>
          <AppButton
            size="sm"
            variant={kind === "food" ? "default" : "outline"}
            radius="xl"
            onClick={() => {
              setKind("food");
              setTag(null);
            }}
          >
            {t("filterFood")}
          </AppButton>
          <AppButton
            size="sm"
            variant={kind === "drink" ? "default" : "outline"}
            radius="xl"
            onClick={() => {
              setKind("drink");
              setTag(null);
            }}
          >
            {t("filterDrink")}
          </AppButton>
        </Group>

        <Group gap="xs">
          <Chip
            checked={tag === null}
            onChange={() => setTag(null)}
            radius="xl"
            color="brand"
            variant="filled"
          >
            {t("allTags")}
          </Chip>
          {boardTags.map((tg) => {
            const key = menuTagMessageKey(tg);
            return (
              <Chip
                key={tg}
                checked={tag === tg}
                onChange={() => setTag(tg === tag ? null : tg)}
                radius="xl"
                color="brand"
                variant="filled"
              >
                {key ? tTag(key) : tg}
              </Chip>
            );
          })}
        </Group>

        {loading ? (
          <Group justify="center" py={64}>
            <Loader color="gray" />
          </Group>
        ) : items.length === 0 ? (
          <Paper radius="xl" withBorder py={48} ta="center" style={{ borderStyle: "dashed" }}>
            <Text size="sm" c="dimmed">
              {t("empty")}
            </Text>
          </Paper>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
            {items.map((row) => {
              const price = row.price
                ? formatPrice({
                    amount: row.price.amount,
                    currency: row.price.currency as "HUF" | "EUR",
                    unit: row.price.unit as
                      | "each"
                      | "glass"
                      | "bottle"
                      | "portion"
                      | "ticket"
                      | undefined,
                    source: row.price.source as "published" | "estimated",
                  })
                : null;
              return (
                <UnstyledButton key={row.id} onClick={() => openRow(row)} w="100%">
                  <Paper radius="xl" withBorder p="md" w="100%">
                    <Text fw={500}>{row.name}</Text>
                    <Text size="xs" c="dimmed" mt={4}>
                      {t("atVenue", {
                        venue: row.venue.name,
                        kind: itemKindLabel(row.kind),
                        section: row.sectionTitle,
                      })}
                      {row.eventTitle ? ` · ${row.eventTitle}` : ""}
                    </Text>
                    <Group gap={4} align="flex-start" mt="xs" wrap="nowrap">
                      <MapPin size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Box>
                        <Text size="xs" span>
                          {row.venue.borough} · {row.venue.neighborhood}
                        </Text>
                        <Text size="xs" c="dimmed" display="block" mt={2}>
                          {row.venue.address}
                        </Text>
                      </Box>
                    </Group>
                    {price ? (
                      <Text size="sm" fw={600} mt="sm">
                        {price.main}
                        {price.suffix ? (
                          <Text component="span" size="xs" fw={400} c="dimmed" ml={4}>
                            {price.suffix}
                          </Text>
                        ) : null}
                      </Text>
                    ) : null}
                  </Paper>
                </UnstyledButton>
              );
            })}
          </SimpleGrid>
        )}
      </Stack>
    </Stack>
  );
}
