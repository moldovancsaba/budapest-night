"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Users,
  HandCoins,
  Plus,
  Minus,
  RotateCcw,
  Copy,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppButton } from "@/components/mantine/AppButton";
import { EmptyState } from "../EmptyState";
import { useCalculator, useCrewSplit } from "@/store/useScout";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useFormatHuf } from "@/hooks/useFormatHuf";
import { computeCrewSplit } from "@/lib/crewSplit";
import { providerLineHuf } from "@/lib/venueDisplay";
import { notify } from "@/lib/notify";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import {
  ActionIcon,
  Grid,
  Group,
  Loader,
  Paper,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

const TIP_PRESETS = [0, 10, 15, 20] as const;

export function SplitCheckView() {
  const t = useTranslations("split");
  const { items } = useCalculator();
  const {
    settings,
    setPeople,
    setTipPercent,
    setRoundUp,
    setManualTotal,
    reset,
  } = useCrewSplit();
  const { data: providers = [], isLoading } = useProvidersCatalog();
  const { displayCurrency, rates } = useDisplayCurrency();
  const formatHuf = useFormatHuf();
  const [manualInput, setManualInput] = useState("");

  const budgetSubtotalHuf = useMemo(() => {
    return items.reduce((sum, i) => {
      const p = providers.find((x) => x.id === i.providerId);
      if (!p) return sum;
      return sum + providerLineHuf(p, i.classes, rates);
    }, 0);
  }, [items, providers, rates]);

  const usingBudget = budgetSubtotalHuf > 0;
  const subtotalHuf = usingBudget ? budgetSubtotalHuf : (settings.manualTotal ?? 0);

  const split = computeCrewSplit(
    subtotalHuf,
    settings.people,
    settings.tipPercent,
    settings.roundUp,
  );
  const venueCount = items.filter((i) =>
    providers.some((p) => p.id === i.providerId),
  ).length;

  const applyManual = () => {
    const n = parseFloat(manualInput.replace(",", "."));
    if (Number.isFinite(n) && n > 0) {
      let huf = n;
      if (displayCurrency === "EUR") huf = Math.round(n * rates.hufPerEur);
      else if (displayCurrency === "USD") huf = Math.round(n * rates.hufPerUsd);
      setManualTotal(huf);
      notify.success(t("manualApplied"));
    } else {
      setManualTotal(null);
      setManualInput("");
    }
  };

  const copyShare = async () => {
    const line = t("shareLine", {
      perPerson: formatHuf(split.perPerson),
      people: settings.people,
      total: formatHuf(split.grandTotal),
    });
    try {
      await navigator.clipboard.writeText(line);
      notify.success(t("copied"));
    } catch {
      notify.error(t("copyFailed"));
    }
  };

  if (isLoading) {
    return (
      <Group justify="center" py={96}>
        <Loader color="gray" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Group gap="xs">
          <Sparkles size={14} />
          <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
            {t("eyebrow")}
          </Text>
        </Group>
        <Title order={1} size="h2" tt="uppercase" lts="0.02em">
          {t("title")}
        </Title>
        <Text size="sm" c="dimmed" maw={640}>
          {t("subtitle")}
        </Text>
      </Stack>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="md">
            <Paper radius="xl" withBorder p="lg">
              <Title order={2} size="h4" tt="uppercase" lts="0.04em">
                {t("sourceTitle")}
              </Title>
              {usingBudget ? (
                <Stack gap="sm" mt="md">
                  <Text size="sm" c="dimmed">
                    {t("fromBudget", {
                      count: venueCount,
                      total: formatHuf(budgetSubtotalHuf),
                    })}
                  </Text>
                  <AppButton
                    component={Link}
                    href={buildPathForView("Calculator")}
                    variant="outline"
                    size="sm"
                    radius="xl"
                    rightSection={<ArrowRight size={14} />}
                  >
                    {t("editBudget")}
                  </AppButton>
                </Stack>
              ) : (
                <Stack gap="sm" mt="md">
                  <Text size="sm" c="dimmed">
                    {t("manualHint")}
                  </Text>
                  <Group gap="xs" wrap="wrap">
                    <TextInput
                      type="number"
                      min={0}
                      step={1}
                      placeholder={t("manualPlaceholder")}
                      value={manualInput}
                      onChange={(e) => setManualInput(e.currentTarget.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyManual()}
                      maw={200}
                      radius="xl"
                    />
                    <AppButton radius="xl" onClick={applyManual}>
                      {t("manualApply")}
                    </AppButton>
                    <AppButton
                      component={Link}
                      href={buildPathForView("Calculator")}
                      variant="outline"
                      radius="xl"
                    >
                      {t("goBudget")}
                    </AppButton>
                  </Group>
                </Stack>
              )}
            </Paper>

            {subtotalHuf <= 0 ? (
              <EmptyState
                icon={HandCoins}
                title={t("emptyTitle")}
                message={t("emptyMessage")}
              />
            ) : (
              <>
                <Paper radius="xl" withBorder p="lg">
                  <Group justify="space-between" wrap="nowrap">
                    <Title order={2} size="h4" tt="uppercase" lts="0.04em">
                      {t("crewTitle")}
                    </Title>
                    <Group gap="xs" wrap="nowrap">
                      <ActionIcon
                        variant="outline"
                        radius="xl"
                        size="lg"
                        onClick={() => setPeople(settings.people - 1)}
                        aria-label={t("fewerPeople")}
                      >
                        <Minus size={16} />
                      </ActionIcon>
                      <Group gap={4} wrap="nowrap" miw={48} justify="center">
                        <Users size={20} />
                        <Text size="xl" fw={700}>
                          {settings.people}
                        </Text>
                      </Group>
                      <ActionIcon
                        variant="outline"
                        radius="xl"
                        size="lg"
                        onClick={() => setPeople(settings.people + 1)}
                        aria-label={t("morePeople")}
                      >
                        <Plus size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Slider
                    mt="xl"
                    min={2}
                    max={20}
                    step={1}
                    value={settings.people}
                    onChange={(v) => setPeople(v)}
                    color="brand"
                  />
                  <Text size="xs" c="dimmed" mt="xs">
                    {t("crewHint")}
                  </Text>
                </Paper>

                <Paper radius="xl" withBorder p="lg">
                  <Title order={2} size="h4" tt="uppercase" lts="0.04em">
                    {t("tipTitle")}
                  </Title>
                  <Group gap="xs" mt="md">
                    {TIP_PRESETS.map((pct) => (
                      <AppButton
                        key={pct}
                        size="sm"
                        radius="xl"
                        variant={settings.tipPercent === pct ? "default" : "outline"}
                        onClick={() => setTipPercent(pct)}
                      >
                        {pct === 0 ? t("noTip") : `${pct}%`}
                      </AppButton>
                    ))}
                  </Group>
                  <Paper radius="xl" withBorder p="md" mt="lg">
                    <Group justify="space-between" wrap="nowrap">
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>
                          {t("roundUpLabel")}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {t("roundUpHint")}
                        </Text>
                      </Stack>
                      <Switch
                        checked={settings.roundUp}
                        onChange={(e) => setRoundUp(e.currentTarget.checked)}
                        color="brand"
                      />
                    </Group>
                  </Paper>
                </Paper>
              </>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper
            radius="xl"
            withBorder
            p="lg"
            style={{
              position: "sticky",
              top: 96,
              opacity: subtotalHuf <= 0 ? 0.6 : 1,
            }}
          >
            <Title order={3} size="h4" tt="uppercase" lts="0.04em">
              {t("resultTitle")}
            </Title>
            <Text size="xs" c="dimmed" mt={4}>
              {t("resultSubtitle")}
            </Text>

            <Stack gap="xs" mt="lg">
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t("lineSubtotal")}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatHuf(split.subtotal)}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {t("lineTip", { percent: settings.tipPercent })}
                </Text>
                <Text size="sm" c="dimmed">
                  {formatHuf(split.tipAmount)}
                </Text>
              </Group>
              <Group justify="space-between" pt="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
                <Text size="sm" fw={500}>
                  {t("lineTotal")}
                </Text>
                <Text size="sm" fw={500}>
                  {formatHuf(split.grandTotal)}
                </Text>
              </Group>
            </Stack>

            <Paper radius="xl" withBorder p="lg" mt="lg" ta="center" bg="gray.0">
              <Text size="xs" fw={600} tt="uppercase" c="dimmed" lts="0.2em">
                {t("eachPays")}
              </Text>
              <Title order={2} size="3rem" mt="xs">
                {formatHuf(split.perPerson)}
              </Title>
              <Text size="xs" c="dimmed" mt="xs">
                {settings.roundUp && split.perPerson > split.perPersonRaw
                  ? t("roundedNote", { raw: split.perPersonRaw.toFixed(2) })
                  : t("splitAmong", { count: settings.people })}
              </Text>
            </Paper>

            <Text size="sm" c="dimmed" ta="center" mt="md" fs="italic">
              {t("funLine")}
            </Text>

            <Stack gap="xs" mt="lg">
              <AppButton
                disabled={subtotalHuf <= 0}
                onClick={copyShare}
                fullWidth
                radius="xl"
                leftSection={<Copy size={16} />}
              >
                {t("copyCta")}
              </AppButton>
              <AppButton
                variant="subtle"
                size="sm"
                onClick={reset}
                fullWidth
                radius="xl"
                leftSection={<RotateCcw size={14} />}
                c="dimmed"
              >
                {t("reset")}
              </AppButton>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
