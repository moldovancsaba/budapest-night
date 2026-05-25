"use client";

import type { Provider } from "@/types/provider";
import type { EventOffering, VenueMenu } from "@/types/menu";
import { useFormatMenuPrice } from "@/hooks/useFormatMenuPrice";
import { useTranslations } from "next-intl";
import { inferMenuItemKind } from "@/lib/menu/flattenMenuItems";
import { menuTagMatchesItemKind, menuTagMessageKey } from "@/data/menuTags";
import type { MenuSectionKind } from "@/types/menu";
import { Anchor, Badge, Group, Paper, Stack, Text } from "@mantine/core";
import { MANTINE_PANEL_RADIUS } from "@/lib/gds/surfaceTokens";

function sectionKindLabel(
  kind: MenuSectionKind,
  tMenu: ReturnType<typeof useTranslations<"menu">>,
): string {
  if (kind === "food") return tMenu("sectionKind.food");
  if (kind === "drink") return tMenu("sectionKind.drink");
  return tMenu("sectionKind.mixed");
}

function MenuBlock({
  menu,
  verifiedLabel,
}: {
  menu: VenueMenu;
  verifiedLabel: string;
}) {
  const formatPrice = useFormatMenuPrice();
  const tMenu = useTranslations("menu");
  const tTag = useTranslations("menuTag");

  if (!menu.sections.length) return null;

  return (
    <Stack gap="md">
      <Text size="xs" c="dimmed">
        {verifiedLabel}: {menu.lastVerifiedAt}
        {menu.menuUrl ? (
          <>
            {" · "}
            <Anchor href={menu.menuUrl} target="_blank" rel="noreferrer" size="xs">
              {menu.menuUrl.replace(/^https?:\/\//, "").slice(0, 48)}
            </Anchor>
          </>
        ) : null}
      </Text>
      {menu.sections.map((sec) => (
        <Paper key={sec.id} withBorder radius={MANTINE_PANEL_RADIUS} p="md" bg="gray.0">
          <Group gap="xs" align="baseline" wrap="wrap">
            <Text fw={600} size="sm" ff="var(--mantine-font-family-headings)">
              {sec.title}
            </Text>
            <Badge radius="xl" variant="light" color="gray" size="xs" tt="uppercase">
              {sectionKindLabel(sec.kind, tMenu)}
            </Badge>
          </Group>
          <Stack component="ul" gap="sm" mt="sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {sec.items.map((item) => {
              const itemKind =
                item.kind === "food" || item.kind === "drink"
                  ? item.kind
                  : (() => {
                      const inferred = inferMenuItemKind(item);
                      if (inferred !== "other") return inferred;
                      if (sec.kind === "food" || sec.kind === "drink") return sec.kind;
                      return inferred;
                    })();
              const displayTags = item.tags.filter((tag) =>
                menuTagMatchesItemKind(tag, itemKind),
              );
              const price = item.price ? formatPrice(item.price) : null;
              return (
                <Group
                  key={item.id}
                  component="li"
                  justify="space-between"
                  align="flex-start"
                  gap="md"
                  wrap="nowrap"
                >
                  <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {item.name}
                    </Text>
                    {item.description ? (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    ) : null}
                    {displayTags.length > 0 ? (
                      <Group gap={6}>
                        {displayTags.map((tag) => {
                          const key = menuTagMessageKey(tag);
                          return (
                            <Badge key={tag} radius="xl" variant="light" color="gray" size="xs">
                              {key ? tTag(key) : tag}
                            </Badge>
                          );
                        })}
                      </Group>
                    ) : null}
                  </Stack>
                  {price ? (
                    <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
                      <Text size="sm" fw={600} ta="right">
                        {price.main}
                      </Text>
                      {price.suffix ? (
                        <Text size="xs" c="dimmed" ta="right">
                          {price.suffix}
                        </Text>
                      ) : null}
                    </Stack>
                  ) : null}
                </Group>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}

export function VenueMenuPanel({ provider }: { provider: Provider }) {
  const t = useTranslations("menu");
  const formatPrice = useFormatMenuPrice();
  const menu = provider.menu;
  const offerings = provider.eventOfferings ?? [];

  if (!menu?.sections.length && offerings.length === 0) {
    return (
      <Text size="sm" c="dimmed">
        {t("empty")}
      </Text>
    );
  }

  return (
    <Stack gap="xl">
      {menu?.sections.length ? (
        <MenuBlock menu={menu} verifiedLabel={t("verified")} />
      ) : null}
      {offerings.map((ev: EventOffering) => (
        <Paper key={ev.id} withBorder radius={MANTINE_PANEL_RADIUS} p="md" bg="gray.1">
          <Text fw={600} size="sm" ff="var(--mantine-font-family-headings)">
            {ev.title}
          </Text>
          {ev.startsAt ? (
            <Text size="xs" c="dimmed" mt={4}>
              {ev.startsAt}
            </Text>
          ) : null}
          <Stack component="ul" gap="sm" mt="sm" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {ev.items.map((item) => {
              const price = item.price ? formatPrice(item.price) : null;
              return (
                <Group key={item.id} component="li" justify="space-between" gap="md">
                  <Text size="sm">{item.name}</Text>
                  {price ? (
                    <Text size="sm" fw={600}>
                      {price.main}
                      {price.suffix ?? ""}
                    </Text>
                  ) : null}
                </Group>
              );
            })}
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
