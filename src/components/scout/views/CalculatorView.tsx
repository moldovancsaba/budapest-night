import { useCalculator } from "@/store/useScout";
import { Calculator, Minus, Plus, Trash2, Users, X } from "@/components/gds/icons";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import { EmptyState } from "../EmptyState";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useCalculatorCopy } from "@/hooks/useLocalizedSiteCopy";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { providerLineHuf } from "@/lib/venueDisplay";
import { useFormatHuf } from "@/hooks/useFormatHuf";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useFormatVenuePrice, useVenueLocationLine } from "@/hooks/useVenueDisplay";
import { AppButton } from "@/components/gds/AppButton";
import {
  ActionIcon,
  Box,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export function CalculatorView() {
  const t = useTranslations("calculator");
  const ts = useTranslations("split");
  const c = useCalculatorCopy();
  const { items, setClasses, remove, clear } = useCalculator();
  const { data: providers = [], isLoading } = useProvidersCatalog();
  const locationLine = useVenueLocationLine();
  const formatPrice = useFormatVenuePrice();
  const formatHuf = useFormatHuf();
  const { rates } = useDisplayCurrency();

  const rows = items
    .map((i) => {
      const p = providers.find((x) => x.id === i.providerId);
      if (!p) return null;
      return { ...i, provider: p, subtotalHuf: providerLineHuf(p, i.classes, rates) };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const totalHuf = rows.reduce((sum, r) => sum + r.subtotalHuf, 0);

  if (isLoading) {
    return (
      <Group justify="center" py={96}>
        <Loader color="gray" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-end" wrap="wrap">
        <Stack gap={4}>
          <Title order={1} size="h2" tt="uppercase" lts="0.02em">
            {c.title}
          </Title>
          <Text size="sm" c="dimmed">
            {c.subtitle}
          </Text>
        </Stack>
        {rows.length > 0 && (
          <AppButton variant="outline" radius="xl" onClick={clear} leftSection={<Trash2 size={16} />}>
            {c.clearAllCta}
          </AppButton>
        )}
      </Group>

      {rows.length === 0 ? (
        <EmptyState icon={Calculator} title={c.emptyTitle} message={c.emptyMessage} />
      ) : (
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Stack gap="sm">
              {rows.map((r) => {
                const linePrice = formatPrice(r.provider);
                return (
                  <Paper key={r.providerId} radius="xl" withBorder p="md">
                    <Group wrap="nowrap" align="center" gap="md">
                      <Box pos="relative" w={64} h={64} style={{ flexShrink: 0, overflow: "hidden", borderRadius: 12 }}>
                        <ResolvedCoverImage
                          src={
                            r.provider.image?.trim()
                              ? r.provider.image
                              : CMS_MEDIA.fallbackListing
                          }
                          resolveBase={r.provider.website}
                          alt=""
                        />
                      </Box>
                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={600} truncate>
                          {r.provider.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {locationLine(r.provider.borough, r.provider.neighborhood)} ·{" "}
                          {linePrice.main}
                          {linePrice.suffix ?? ""}
                        </Text>
                      </Stack>
                      <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
                        <ActionIcon
                          variant="subtle"
                          radius="xl"
                          onClick={() => setClasses(r.providerId, r.classes - 1)}
                          aria-label={t("decreaseGuests")}
                        >
                          <Minus size={14} />
                        </ActionIcon>
                        <Text w={32} ta="center" fw={600} size="sm">
                          {r.classes}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          radius="xl"
                          onClick={() => setClasses(r.providerId, r.classes + 1)}
                          aria-label={t("increaseGuests")}
                        >
                          <Plus size={14} />
                        </ActionIcon>
                      </Group>
                      <Text fw={700} w={80} ta="right" style={{ flexShrink: 0 }}>
                        {formatHuf(r.subtotalHuf)}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        radius="xl"
                        color="gray"
                        onClick={() => remove(r.providerId)}
                        aria-label={t("remove", { name: r.provider.name })}
                      >
                        <X size={16} />
                      </ActionIcon>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Paper
              radius="xl"
              withBorder
              p="lg"
              style={{ position: "sticky", top: 24 }}
            >
              <Title order={3} size="h5" tt="uppercase" lts="0.04em">
                {c.asideTitle}
              </Title>
              <Text size="xs" c="dimmed" mt={4}>
                {c.asideSubtitle}
              </Text>
              <Stack gap="xs" mt="lg" pt="md">
                <Divider />
                {rows.map((r) => (
                  <Group key={r.providerId} justify="space-between" gap="xs" wrap="nowrap">
                    <Text size="sm" c="dimmed" truncate style={{ flex: 1 }}>
                      {r.provider.name} × {r.classes}{" "}
                      {r.classes === 1 ? t("guest") : t("guests")}
                    </Text>
                    <Text size="sm" fw={500} style={{ flexShrink: 0 }}>
                      {formatHuf(r.subtotalHuf)}
                    </Text>
                  </Group>
                ))}
              </Stack>
              <Divider mt="lg" />
              <Group justify="space-between" align="baseline" mt="md">
                <Text fw={600} size="sm" tt="uppercase" lts="0.04em">
                  {c.estimatedTotalLabel}
                </Text>
                <Title order={2} size="h2">
                  {formatHuf(totalHuf)}
                </Title>
              </Group>
              <Text size="xs" c="dimmed" mt="sm" lh={1.5}>
                {c.asideFootnote}
              </Text>
              {totalHuf > 0 && (
                <AppButton
                  component={Link}
                  href={buildPathForView("Split Check")}
                  fullWidth
                  radius="xl"
                  mt="md"
                  leftSection={<Users size={16} />}
                >
                  {ts("fromBudgetCta")}
                </AppButton>
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}
