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
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { EmptyState } from "../EmptyState";
import { useCalculator, useCrewSplit } from "@/store/useScout";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import { useFormatHuf } from "@/hooks/useFormatHuf";
import { computeCrewSplit } from "@/lib/crewSplit";
import { providerLineHuf } from "@/lib/venueDisplay";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import { toast } from "sonner";

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
      toast.success(t("manualApplied"));
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
      toast.success(t("copied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {t("eyebrow")}
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Source total */}
          <section className={cn(CYBER_PANEL, "p-6")}>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("sourceTitle")}
            </h2>
            {usingBudget ? (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("fromBudget", {
                    count: venueCount,
                    total: formatHuf(budgetSubtotalHuf),
                  })}
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border text-foreground"
                >
                  <Link href={buildPathForView("Calculator")}>
                    {t("editBudget")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-muted-foreground">
                  {t("manualHint")}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Input
                    type="number"
                    min={0}
                    step={1}
                    placeholder={t("manualPlaceholder")}
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyManual()}
                    className="max-w-[200px] rounded-full border-border bg-card/80"
                  />
                  <Button
                    onClick={applyManual}
                    className="rounded-full bg-primary text-primary-foreground"
                  >
                    {t("manualApply")}
                  </Button>
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={buildPathForView("Calculator")}>
                      {t("goBudget")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </section>

          {subtotalHuf <= 0 ? (
            <EmptyState
              icon={HandCoins}
              title={t("emptyTitle")}
              message={t("emptyMessage")}
            />
          ) : (
            <>
              {/* Crew size */}
              <section className={cn(CYBER_PANEL, "p-6")}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {t("crewTitle")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPeople(settings.people - 1)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-foreground/40"
                      aria-label={t("fewerPeople")}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="flex min-w-[3rem] items-center justify-center gap-1 font-display text-2xl font-bold text-foreground">
                      <Users className="h-5 w-5" />
                      {settings.people}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPeople(settings.people + 1)}
                      className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:border-foreground/40"
                      aria-label={t("morePeople")}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Slider
                  className="mt-6"
                  min={2}
                  max={20}
                  step={1}
                  value={[settings.people]}
                  onValueChange={([v]) => setPeople(v ?? settings.people)}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("crewHint")}
                </p>
              </section>

              {/* Tip */}
              <section className={cn(CYBER_PANEL, "p-6")}>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  {t("tipTitle")}
                </h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {TIP_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTipPercent(pct)}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                        settings.tipPercent === pct
                          ? "border-foreground bg-primary text-primary-foreground"
                          : "border-border bg-card/80 hover:border-foreground/40 hover:text-foreground",
                      )}
                    >
                      {pct === 0 ? t("noTip") : `${pct}%`}
                    </button>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-card/50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("roundUpLabel")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("roundUpHint")}
                    </p>
                  </div>
                  <Switch
                    checked={settings.roundUp}
                    onCheckedChange={setRoundUp}
                  />
                </div>
              </section>
            </>
          )}
        </div>

        {/* Result aside */}
        <aside
          className={cn(
            CYBER_PANEL,
            "h-fit p-6 lg:sticky lg:top-24",
            subtotalHuf <= 0 && "opacity-60",
          )}
        >
          <h3 className="font-display text-lg font-semibold text-foreground">
            {t("resultTitle")}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("resultSubtitle")}
          </p>

          <div className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{t("lineSubtotal")}</span>
              <span>{formatHuf(split.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>{t("lineTip", { percent: settings.tipPercent })}</span>
              <span>{formatHuf(split.tipAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-border/60 pt-2 font-medium text-foreground">
              <span>{t("lineTotal")}</span>
              <span>{formatHuf(split.grandTotal)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-muted p-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t("eachPays")}
            </p>
            <p className="mt-2 font-display text-5xl font-bold text-foreground">
              {formatHuf(split.perPerson)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {settings.roundUp && split.perPerson > split.perPersonRaw
                ? t("roundedNote", { raw: split.perPersonRaw.toFixed(2) })
                : t("splitAmong", { count: settings.people })}
            </p>
          </div>

          <p className="mt-4 text-center text-sm italic text-muted-foreground">
            {t("funLine")}
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Button
              disabled={subtotalHuf <= 0}
              onClick={copyShare}
              className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Copy className="h-4 w-4" /> {t("copyCta")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="w-full rounded-full text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("reset")}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
