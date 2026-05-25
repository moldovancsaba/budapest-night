"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, MapPin, RefreshCw } from "@/components/gds/icons";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { Link, useRouter } from "@/i18n/routing";
import { buildSectionPath, buildTourPath } from "@/lib/appPaths";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { AppButton } from "@/components/gds/AppButton";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  Anchor,
  Badge,
  Box,
  Card,
  Group,
  List,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

type TourStop = {
  providerId: string;
  providerName: string;
  category: string;
  borough: string;
  neighborhood: string;
  address: string;
  website: string;
  image: string;
  highlightItems: { name: string; priceLabel?: string }[];
};

interface Props {
  tourId: string;
  seed: string | null;
  onOpen: (p: Provider) => void;
}

export function TourView({ tourId, seed, onOpen }: Props) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("tours");
  const router = useRouter();
  const { data: providers = [] } = useProvidersCatalog();
  const [stops, setStops] = useState<TourStop[]>([]);
  const [activeSeed, setActiveSeed] = useState(seed ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (useSeed: string) => {
      setLoading(true);
      setError(null);
      try {
        const qs = new URLSearchParams({ locale });
        if (useSeed) qs.set("seed", useSeed);
        const res = await fetch(
          `/api/public/tours/${encodeURIComponent(tourId)}?${qs.toString()}`,
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "error");
          setStops([]);
          return;
        }
        setActiveSeed(data.seed);
        setStops(data.stops ?? []);
      } catch {
        setError("error");
        setStops([]);
      } finally {
        setLoading(false);
      }
    },
    [tourId, locale],
  );

  useEffect(() => {
    void load(seed ?? `${tourId}-${Date.now()}`);
  }, [load, seed, tourId]);

  const reshuffle = () => {
    const next = `${tourId}-${Date.now()}`;
    router.replace(buildTourPath(tourId, next));
    void load(next);
  };

  const title = t(`${tourId}.title`);
  const description = t(`${tourId}.description`);

  return (
    <Stack gap="lg">
      <Anchor
        component={Link}
        href={buildSectionPath("eat-drink")}
        size="sm"
        c="dimmed"
        underline="never"
      >
        <Group gap={4} wrap="nowrap">
          <ChevronLeft size={16} />
          {t("backToEatDrink")}
        </Group>
      </Anchor>

      <Stack gap="sm">
        <Title order={1} size="h2" tt="uppercase" lts="0.02em">
          {title}
        </Title>
        <Text size="sm" c="dimmed" maw={640}>
          {description}
        </Text>
        <Group gap="xs">
          <AppButton
            size="sm"
            variant="outline"
            radius="xl"
            onClick={reshuffle}
            disabled={loading}
            leftSection={<RefreshCw size={16} />}
          >
            {t("reshuffle")}
          </AppButton>
        </Group>
      </Stack>

      {loading ? (
        <Group justify="center" py={80}>
          <Loader color="gray" />
        </Group>
      ) : error ? (
        <Paper radius="xl" withBorder py={48} ta="center">
          <Text size="sm" c="dimmed">
            {t(`errors.${error}`)}
          </Text>
        </Paper>
      ) : (
        <Stack component="ol" gap="lg" style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {stops.map((stop, idx) => {
            const provider = providers.find((p) => p.id === stop.providerId);
            return (
              <Card key={`${stop.providerId}-${idx}`} radius="xl" p={0} withBorder>
                <Card.Section>
                  <Box pos="relative" h={160}>
                    <ResolvedCoverImage
                      src={stop.image || CMS_MEDIA.fallbackListing}
                      resolveBase={stop.website}
                      alt={stop.providerName}
                    />
                    <Badge
                      pos="absolute"
                      top={16}
                      left={16}
                      radius="xl"
                      color="brand"
                      variant="filled"
                      size="lg"
                    >
                      {idx + 1}
                    </Badge>
                  </Box>
                </Card.Section>
                <Stack gap="sm" p="lg">
                  <Stack gap={4}>
                    <Title order={2} size="h4">
                      {stop.providerName}
                    </Title>
                    <Group gap={4} wrap="nowrap" align="flex-start">
                      <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <Text size="xs" c="dimmed">
                        {stop.address}
                      </Text>
                    </Group>
                    <Text size="xs" c="dimmed">
                      {stop.borough} · {stop.neighborhood}
                    </Text>
                  </Stack>
                  {stop.highlightItems.length > 0 && (
                    <List size="sm" spacing={4}>
                      {stop.highlightItems.map((item) => (
                        <List.Item key={item.name}>
                          <Group justify="space-between" gap="sm" wrap="nowrap">
                            <Text span size="sm">
                              {item.name}
                            </Text>
                            {item.priceLabel ? (
                              <Text span size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                                {item.priceLabel}
                              </Text>
                            ) : null}
                          </Group>
                        </List.Item>
                      ))}
                    </List>
                  )}
                  {provider ? (
                    <AppButton size="sm" radius="xl" onClick={() => onOpen(provider)}>
                      {t("openVenue")}
                    </AppButton>
                  ) : null}
                </Stack>
              </Card>
            );
          })}
        </Stack>
      )}

      {activeSeed ? (
        <Text ta="center" size="xs" c="dimmed">
          {t("shareHint")}
        </Text>
      ) : null}
    </Stack>
  );
}
