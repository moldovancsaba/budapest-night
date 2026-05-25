import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Heart,
  Share2,
  Plus,
  Minus,
  X,
  Eye,
  MapPin,
  Mail,
  ArrowRight,
} from "@/components/gds/icons";
import { AppButton } from "@/components/gds/AppButton";
import { notify } from "@/lib/notify";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useAccountCopy } from "@/hooks/useLocalizedSiteCopy";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useFormatHuf } from "@/hooks/useFormatHuf";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useCategoryLabel,
  useFormatVenuePrice,
  usePreferenceOptionLabel,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { providerLineHuf } from "@/lib/venueDisplay";
import { useTranslations } from "next-intl";
import { useSaved, useCalculator } from "@/store/useScout";
import type { Provider, BoroughChoice, Category } from "@/types/provider";
import type {
  AccountSavedCategoryFilter,
  SiteAccountSettings,
} from "@/types/site";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { ResolvedCoverImage } from "../ResolvedCoverImage";
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Checkbox,
  Chip,
  Group,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";

interface Props {
  onNavigate: (
    view: Category | "Events" | "Saved" | "Calculator" | "Meet-Up Groups",
    location?: { borough?: BoroughChoice; neighborhood?: string },
  ) => void;
  onOpenProvider: (p: Provider) => void;
  onShareProvider: (p: Provider) => void;
}

function withSaved(tab: string, savedTabId: string, sectionTabId: string) {
  return tab === savedTabId || tab === sectionTabId;
}

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

function categoryBadgeLabel(
  cat: string,
  categoryLabel: ReturnType<typeof useCategoryLabel>,
  tNav: ReturnType<typeof useTranslations>,
) {
  switch (cat) {
    case "Events":
    case "Venues":
      return categoryLabel("Venues");
    case "Parties":
      return categoryLabel("Parties");
    case "Restaurants":
      return categoryLabel("Restaurants");
    case "Cafés":
      return categoryLabel("Cafés");
    case "Meet-Up Group":
      return tNav("culture");
    default:
      return cat;
  }
}

export function MyAccountView({
  onNavigate,
  onOpenProvider,
  onShareProvider,
}: Props) {
  const acc = useAccountCopy();
  const tNav = useTranslations("nav");
  const categoryLabel = useCategoryLabel();

  const badgeFor = useCallback(
    (cat: string) => {
      switch (cat) {
        case "Events":
        case "Venues":
          return {
            label: categoryLabel("Venues"),
            filter: "Venues" as const,
          };
        case "Parties":
          return {
            label: categoryLabel("Parties"),
            filter: "Parties" as const,
          };
        case "Restaurants":
          return {
            label: categoryLabel("Restaurants"),
            filter: "Restaurants" as const,
          };
        case "Cafés":
          return {
            label: categoryLabel("Cafés"),
            filter: "Cafés" as const,
          };
        case "Meet-Up Group":
          return {
            label: tNav("culture"),
            filter: "Culture" as const,
          };
        default:
          return {
            label: cat,
            filter: "All" as const,
          };
      }
    },
    [categoryLabel, tNav],
  );

  const [tab, setTab] = useState(acc.saved.tabId);
  const [filter, setFilter] = useState<AccountSavedCategoryFilter>("All");
  const { saved, toggle: toggleSaved } = useSaved();
  const { add: addToCalc } = useCalculator();
  const { data: providers = [] } = useProvidersCatalog();

  const savedProviders: Provider[] = useMemo(
    () => providers.filter((p) => saved.includes(p.id)),
    [saved, providers],
  );

  type Item = {
    kind: "provider";
    data: Provider;
    categoryFilter: AccountSavedCategoryFilter;
  };

  const items: Item[] = useMemo(
    () =>
      savedProviders.map((p) => ({
        kind: "provider" as const,
        data: p,
        categoryFilter: badgeFor(p.category).filter as AccountSavedCategoryFilter,
      })),
    [savedProviders, badgeFor],
  );

  const filtered =
    filter === "All" ? items : items.filter((i) => i.categoryFilter === filter);

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={1} size="h2" tt="uppercase" lts="0.02em">
          {acc.page.title}
        </Title>
        <Text size="sm" c="dimmed">
          {acc.page.subtitle}
        </Text>
      </Stack>

      <ScrollArea type="auto" offsetScrollbars>
        <Group gap={0} wrap="nowrap" style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}>
          {acc.navTabs.map((navTab) => {
            const active = navTab.id === tab;
            return (
              <UnstyledTab
                key={navTab.id}
                active={active}
                onClick={() => {
                  setTab(navTab.id);
                  document
                    .getElementById(`section-${navTab.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                {navTab.label}
              </UnstyledTab>
            );
          })}
        </Group>
      </ScrollArea>

      <Paper
        id={`section-${acc.saved.tabId}`}
        radius="xl"
        withBorder
        p={{ base: "lg", sm: "xl" }}
        style={{ display: tab !== acc.saved.tabId ? "none" : undefined }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Stack gap={4}>
            <Title order={2} size="h3" tt="uppercase" lts="0.04em">
              {acc.saved.title}
            </Title>
            <Text size="sm" c="dimmed">
              {acc.saved.subtitle}
            </Text>
          </Stack>
          <AppButton
            variant="outline"
            radius="xl"
            onClick={() => onNavigate("Saved")}
            rightSection={<ArrowRight size={16} />}
          >
            {acc.saved.viewAllCta}
          </AppButton>
        </Group>

        <Group gap="xs" mt="md">
          {acc.saved.filterChips.map((c) => (
            <Chip
              key={c.label}
              checked={c.categoryFilter === filter}
              onChange={() => setFilter(c.categoryFilter)}
              radius="xl"
              color="brand"
              variant="filled"
            >
              {c.label}
            </Chip>
          ))}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md" mt="lg">
          {filtered.length === 0 && (
            <Paper radius="xl" p="xl" ta="center" style={{ gridColumn: "1 / -1" }}>
              <Text size="sm" c="dimmed">
                {acc.saved.emptyMessage}
              </Text>
            </Paper>
          )}
          {filtered.map((item) => (
            <SavedProviderCard
              key={`p-${item.data.id}`}
              provider={item.data}
              card={acc.saved.card}
              onView={() => onOpenProvider(item.data)}
              onShare={() => onShareProvider(item.data)}
              onAddToPlan={() => {
                addToCalc(item.data.id);
                notify.success(
                  interpolate(acc.saved.toastAddedToPlan, {
                    name: item.data.name,
                  }),
                );
              }}
              onRemove={() => {
                if (saved.includes(item.data.id)) {
                  toggleSaved(item.data.id);
                  notify.info(
                    interpolate(acc.saved.toastRemoved, {
                      name: item.data.name,
                    }),
                  );
                } else {
                  notify.info(acc.saved.toastSampleRemove);
                }
              }}
            />
          ))}
        </SimpleGrid>
      </Paper>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <ActivityPlanCard
          acc={acc}
          tab={tab}
          onNavigate={onNavigate}
          providers={providers}
        />
        <FamilyPreferencesCard acc={acc} tab={tab} />
        <NeighborhoodCard acc={acc} tab={tab} onNavigate={onNavigate} />
        <AlertsCard acc={acc} tab={tab} />
      </SimpleGrid>

      <Paper radius="xl" withBorder px="lg" py="md" ta="center">
        <Text size="sm" fw={500}>
          {acc.privacy.headline}
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          {acc.privacy.supportTextBefore}{" "}
          <Text
            component="a"
            href={`mailto:${acc.privacy.supportEmail}`}
            fw={600}
            inherit
            style={{ color: "inherit" }}
          >
            {acc.privacy.supportEmail}
          </Text>
          {acc.privacy.supportTextAfter ? ` ${acc.privacy.supportTextAfter}` : null}
        </Text>
      </Paper>
    </Stack>
  );
}

function UnstyledTab({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        whiteSpace: "nowrap",
        padding: "12px 16px",
        fontSize: 14,
        fontWeight: 600,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: active ? "var(--mantine-color-dark-9)" : "var(--mantine-color-dimmed)",
      }}
    >
      {children}
      {active ? (
        <span
          style={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 0,
            height: 2,
            borderRadius: 999,
            background: "var(--mantine-color-dark-9)",
          }}
        />
      ) : null}
    </button>
  );
}

function SavedProviderCard({
  provider,
  card,
  onView,
  onShare,
  onAddToPlan,
  onRemove,
}: {
  provider: Provider;
  card: SiteAccountSettings["saved"]["card"];
  onView: () => void;
  onShare: () => void;
  onAddToPlan: () => void;
  onRemove: () => void;
}) {
  const tNav = useTranslations("nav");
  const tv = useTranslations("venue");
  const categoryLabel = useCategoryLabel();
  const locationLine = useVenueLocationLine();
  const ageLabel = useAgeRangeLabel();
  const activityLabel = useActivityTypeLabel();
  const formatPrice = useFormatVenuePrice();
  const label = categoryBadgeLabel(provider.category, categoryLabel, tNav);
  const price = formatPrice(provider);

  return (
    <Card radius="xl" p={0} withBorder>
      <Card.Section>
        <Box pos="relative" h={144}>
          <ResolvedCoverImage
            src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
            resolveBase={provider.website}
            alt={provider.name}
          />
          <Badge
            pos="absolute"
            top={8}
            left={8}
            radius="xl"
            tt="uppercase"
            variant="light"
            color="gray"
            size="sm"
          >
            {label}
          </Badge>
          <ActionIcon
            pos="absolute"
            top={8}
            right={8}
            radius="xl"
            variant="filled"
            color="gray"
            aria-label={tv("saved")}
          >
            <Heart size={16} fill="var(--mantine-color-brand-6)" color="var(--mantine-color-brand-6)" />
          </ActionIcon>
        </Box>
      </Card.Section>
      <Stack gap="xs" p="md">
        <Title order={3} size="h5" lineClamp={1}>
          {provider.name}
        </Title>
        <Text size="xs" c="dimmed">
          {locationLine(provider.borough, provider.neighborhood)}
        </Text>
        <Text size="xs" c="dimmed">
          {ageLabel(provider.ageRanges[0])} · {activityLabel(provider.activityTypes[0])}
        </Text>
        <Text size="sm" fw={700}>
          {price.main}
          {price.suffix ? (
            <Text component="span" size="xs" fw={400} c="dimmed" ml={4}>
              {price.suffix}
            </Text>
          ) : null}
        </Text>
        <SimpleGrid cols={2} spacing="xs" mt="xs">
          <AppButton size="sm" variant="outline" radius="xl" onClick={onView} leftSection={<Eye size={14} />}>
            {card.viewCta}
          </AppButton>
          <AppButton size="sm" variant="outline" radius="xl" onClick={onShare} leftSection={<Share2 size={14} />}>
            {card.shareCta}
          </AppButton>
          <AppButton size="sm" radius="xl" onClick={onAddToPlan} leftSection={<Plus size={14} />}>
            {card.addToPlanCta}
          </AppButton>
          <AppButton size="sm" variant="subtle" radius="xl" c="dimmed" onClick={onRemove} leftSection={<X size={14} />}>
            {card.removeCta}
          </AppButton>
        </SimpleGrid>
      </Stack>
    </Card>
  );
}

function ActivityPlanCard({
  acc,
  tab,
  onNavigate,
  providers,
}: {
  acc: SiteAccountSettings;
  tab: string;
  onNavigate: Props["onNavigate"];
  providers: Provider[];
}) {
  const tCalc = useTranslations("calculator");
  const formatPrice = useFormatVenuePrice();
  const formatHuf = useFormatHuf();
  const locationLine = useVenueLocationLine();
  const { rates } = useDisplayCurrency();
  const { items, setClasses, remove, clear } = useCalculator();
  const visible = withSaved(tab, acc.saved.tabId, acc.activityPlan.tabId);

  const rows = useMemo(() => {
    return items
      .map((i) => {
        const p = providers.find((x) => x.id === i.providerId);
        if (!p) return null;
        return {
          providerId: i.providerId,
          provider: p,
          qty: i.classes,
          subtotalHuf: providerLineHuf(p, i.classes, rates),
        };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [items, providers, rates]);

  const totalHuf = rows.reduce((s, r) => s + r.subtotalHuf, 0);

  return (
    <Paper
      id={`section-${acc.activityPlan.tabId}`}
      radius="xl"
      withBorder
      p={{ base: "lg", sm: "xl" }}
      style={{ display: !visible ? "none" : undefined }}
    >
      <Stack gap={4}>
        <Title order={2} size="h4" tt="uppercase" lts="0.04em">
          {acc.activityPlan.title}
        </Title>
        <Text size="sm" c="dimmed">
          {acc.activityPlan.subtitle}
        </Text>
      </Stack>

      {rows.length === 0 ? (
        <Paper radius="xl" p="lg" mt="md" ta="center">
          <Text size="sm" c="dimmed">
            {acc.activityPlan.emptyMessage}
          </Text>
        </Paper>
      ) : (
        <>
          <Stack gap="xs" mt="md">
            {rows.map((r) => {
              const linePrice = formatPrice(r.provider);
              return (
                <Paper key={r.providerId} radius="xl" p="sm">
                  <Group justify="space-between" wrap="nowrap" gap="sm">
                    <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={600} truncate>
                        {r.provider.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {locationLine(r.provider.borough, r.provider.neighborhood)} ·{" "}
                        {linePrice.main}
                        {linePrice.suffix ?? ""}
                      </Text>
                    </Stack>
                    <Group gap={4} wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        radius="xl"
                        size="sm"
                        onClick={() => setClasses(r.providerId, r.qty - 1)}
                        aria-label={tCalc("decreaseGuests")}
                      >
                        <Minus size={12} />
                      </ActionIcon>
                      <Text w={24} ta="center" size="sm" fw={600}>
                        {r.qty}
                      </Text>
                      <ActionIcon
                        variant="subtle"
                        radius="xl"
                        size="sm"
                        onClick={() => setClasses(r.providerId, r.qty + 1)}
                        aria-label={tCalc("increaseGuests")}
                      >
                        <Plus size={12} />
                      </ActionIcon>
                    </Group>
                    <Text size="sm" fw={700} w={72} ta="right">
                      {formatHuf(r.subtotalHuf)}
                    </Text>
                    <ActionIcon
                      variant="subtle"
                      radius="xl"
                      size="sm"
                      onClick={() => remove(r.providerId)}
                      aria-label={tCalc("remove", { name: r.provider.name })}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              );
            })}
          </Stack>

          <Group justify="space-between" mt="md" p="md">
            <Text size="sm" fw={600} tt="uppercase" lts="0.04em">
              {acc.activityPlan.estimatedTotalLabel}
            </Text>
            <Title order={2} size="h2">
              {formatHuf(totalHuf)}
            </Title>
          </Group>
        </>
      )}

      <Group gap="xs" mt="md">
        <AppButton radius="xl" onClick={() => onNavigate("Calculator")}>
          {acc.activityPlan.viewFullCta}
        </AppButton>
        <AppButton variant="outline" radius="xl" onClick={() => clear()}>
          {acc.activityPlan.clearCta}
        </AppButton>
      </Group>
    </Paper>
  );
}

function PillToggle({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Chip checked={active} onChange={onClick} radius="xl" color="brand" variant="filled">
      {label}
    </Chip>
  );
}

function FamilyPreferencesCard({
  acc,
  tab,
}: {
  acc: SiteAccountSettings;
  tab: string;
}) {
  const optionLabel = usePreferenceOptionLabel();
  const visible = withSaved(tab, acc.saved.tabId, acc.familyPreferences.tabId);
  const sections = acc.familyPreferences.sections;

  const initial = useMemo(() => {
    const m: Record<string, string[]> = {};
    for (const sec of sections) m[sec.id] = [...sec.defaultSelected];
    return m;
  }, [sections]);

  const [sel, setSel] = useState<Record<string, string[]>>(initial);

  useEffect(() => {
    setSel(initial);
  }, [initial]);

  const toggle = (id: string, set: string[], v: string) => {
    const next = set.includes(v) ? set.filter((x) => x !== v) : [...set, v];
    setSel((s) => ({ ...s, [id]: next }));
  };

  return (
    <Paper
      id={`section-${acc.familyPreferences.tabId}`}
      radius="xl"
      withBorder
      p={{ base: "lg", sm: "xl" }}
      style={{ display: !visible ? "none" : undefined }}
    >
      <Title order={2} size="h4" tt="uppercase" lts="0.04em">
        {acc.familyPreferences.title}
      </Title>
      <Text size="sm" c="dimmed" mt={4}>
        {acc.familyPreferences.subtitle}
      </Text>

      <Stack gap="lg" mt="md">
        {sections.map((sec) => (
          <Stack key={sec.id} gap="xs">
            <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.12em">
              {sec.label}
            </Text>
            <Group gap="xs">
              {sec.options.map((a) => (
                <PillToggle
                  key={a}
                  label={optionLabel(a)}
                  active={(sel[sec.id] ?? []).includes(a)}
                  onClick={() => toggle(sec.id, sel[sec.id] ?? [], a)}
                />
              ))}
            </Group>
          </Stack>
        ))}
      </Stack>

      <AppButton
        radius="xl"
        mt="lg"
        onClick={() => notify.success(acc.familyPreferences.savedToast)}
      >
        {acc.familyPreferences.editCta}
      </AppButton>
    </Paper>
  );
}

function NeighborhoodCard({
  acc,
  tab,
  onNavigate,
}: {
  acc: SiteAccountSettings;
  tab: string;
  onNavigate: Props["onNavigate"];
}) {
  const n = acc.neighborhood;
  const visible = withSaved(tab, acc.saved.tabId, n.tabId);

  return (
    <Paper
      id={`section-${n.tabId}`}
      radius="xl"
      withBorder
      p={{ base: "lg", sm: "xl" }}
      style={{ display: !visible ? "none" : undefined }}
    >
      <Title order={2} size="h4" tt="uppercase" lts="0.04em">
        {n.title}
      </Title>
      <Text size="sm" c="dimmed" mt={4}>
        {n.subtitle}
      </Text>

      <Paper radius="xl" p="md" mt="md">
        <Group align="flex-start" wrap="wrap">
          <ActionIcon variant="light" radius="xl" size="xl" color="gray">
            <MapPin size={20} />
          </ActionIcon>
          <Stack gap={4} style={{ flex: 1, minWidth: 200 }}>
            <Text fw={600}>{n.addressLine1}</Text>
            <Text size="sm" c="dimmed">
              {n.addressLine2}
            </Text>
            <Text size="xs" c="dimmed">
              {n.detectedLabelPrefix}{" "}
              <Text span fw={600} c="dark">
                {n.detectedNeighborhood}
              </Text>{" "}
              · {n.detectedBorough}
            </Text>
          </Stack>
          <AppButton
            size="sm"
            variant="outline"
            radius="xl"
            onClick={() => notify.info(n.updateAddressToast)}
          >
            {n.updateAddressCtaLabel}
          </AppButton>
        </Group>
      </Paper>

      <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.12em" mt="lg">
        {n.nearbySectionLabel}
      </Text>
      <Group gap="xs" mt="xs">
        {n.nearbyNeighborhoods.map((hood) => (
          <AppButton
            key={hood}
            size="sm"
            variant="outline"
            radius="xl"
            onClick={() =>
              onNavigate("Events", {
                borough: n.nearbyNavigateBorough,
                neighborhood: hood,
              })
            }
          >
            {hood}
          </AppButton>
        ))}
      </Group>

      <AppButton
        radius="xl"
        mt="lg"
        onClick={() =>
          onNavigate("Events", {
            borough: n.browseNavigateBorough,
            neighborhood: n.browseNavigateNeighborhood,
          })
        }
        rightSection={<ArrowRight size={16} />}
      >
        {n.browseCtaLabel}
      </AppButton>
    </Paper>
  );
}

function AlertsCard({ acc, tab }: { acc: SiteAccountSettings; tab: string }) {
  const visible = withSaved(tab, acc.saved.tabId, acc.alerts.tabId);
  const a = acc.alerts;

  const [alerts, setAlerts] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(a.options.map((x) => [x, true])),
  );
  useEffect(() => {
    setAlerts(Object.fromEntries(a.options.map((x) => [x, true])));
  }, [a.options]);

  const [freq, setFreq] = useState(a.frequencyChoices[0] ?? "Weekly");
  useEffect(() => {
    setFreq(a.frequencyChoices[0] ?? "Weekly");
  }, [a.frequencyChoices]);

  return (
    <Paper
      id={`section-${a.tabId}`}
      radius="xl"
      withBorder
      p={{ base: "lg", sm: "xl" }}
      style={{ display: !visible ? "none" : undefined }}
    >
      <Title order={2} size="h4" tt="uppercase" lts="0.04em">
        {a.title}
      </Title>
      <Text size="sm" c="dimmed" mt={4}>
        {a.subtitle}
      </Text>

      <Stack gap="md" mt="md">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.12em">
          {a.emailSectionLabel}
        </Text>
        <Stack gap="xs">
          {a.options.map((opt) => (
            <Checkbox
              key={opt}
              label={opt}
              checked={alerts[opt] ?? false}
              onChange={(e) => setAlerts((s) => ({ ...s, [opt]: e.currentTarget.checked }))}
              radius="sm"
              color="brand"
            />
          ))}
        </Stack>
      </Stack>

      <Stack gap="xs" mt="lg">
        <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.12em">
          {a.frequencySectionLabel}
        </Text>
        <Group gap="xs">
          {a.frequencyChoices.map((f) => (
            <Chip
              key={f}
              checked={f === freq}
              onChange={() => setFreq(f)}
              radius="xl"
              color="brand"
              variant="filled"
            >
              {f}
            </Chip>
          ))}
        </Group>
      </Stack>

      <AppButton
        radius="xl"
        mt="lg"
        onClick={() => notify.success(a.savedToast)}
        leftSection={<Mail size={16} />}
      >
        {a.saveCta}
      </AppButton>
    </Paper>
  );
}
