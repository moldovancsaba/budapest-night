"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, MapPin, Search, Sparkles, Wine } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MENU_TAGS, menuTagMessageKey, type MenuTag } from "@/data/menuTags";
import { TOUR_TEMPLATES } from "@/data/tourTemplates";
import { buildTourPath } from "@/lib/appPaths";
import { useFormatMenuPrice } from "@/hooks/useFormatMenuPrice";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type MenuItemRow = {
  id: string;
  name: string;
  kind: string;
  tags: string[];
  price: {
    amount: number;
    currency: string;
    unit?: string;
    source: string;
  } | null;
  providerId: string;
  providerName: string;
  category: string;
  borough: string;
  neighborhood: string;
  sectionTitle: string;
  source: string;
  eventTitle: string | null;
};

interface Props {
  onOpen: (p: Provider) => void;
}

export function EatDrinkView({ onOpen }: Props) {
  const t = useTranslations("eatDrink");
  const tTag = useTranslations("menuTag");
  const formatPrice = useFormatMenuPrice();
  const { data: providers = [] } = useProvidersCatalog();

  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [total, setTotal] = useState(0);
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
      const res = await fetch(`/api/public/menu-items?${params.toString()}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [tag, kind, debouncedQ]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const providerById = useMemo(
    () => new Map(providers.map((p) => [p.id, p])),
    [providers],
  );

  const openRow = (row: MenuItemRow) => {
    const p = providerById.get(row.providerId);
    if (p) onOpen(p);
  };

  return (
    <div className="space-y-8">
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl border border-border/80 p-8 sm:p-10",
          CYBER_PANEL,
        )}
      >
        <div className="relative z-10 max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            <Wine className="h-4 w-4" />
            {t("eyebrow")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Sparkles className="pointer-events-none absolute -right-4 top-4 h-32 w-32 text-primary/20" />
      </div>

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">
          {t("toursTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("toursSubtitle")}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {TOUR_TEMPLATES.map((tpl) => (
            <Link
              key={tpl.id}
              href={buildTourPath(tpl.id)}
              className="group rounded-2xl border border-border/70 bg-card/60 p-5 transition hover:border-primary/50 hover:bg-primary/5"
            >
              <p className="font-display text-base font-semibold text-foreground group-hover:text-primary">
                {t(`tours.${tpl.id}.title`)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {t(`tours.${tpl.id}.description`)}
              </p>
              <span className="mt-3 inline-block text-xs font-medium text-primary">
                {t("startTour")} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t("browseTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading
                ? t("loading")
                : t("resultsCount", { shown: items.length, total })}
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={kind === null ? "default" : "outline"}
            onClick={() => setKind(null)}
          >
            {t("filterAll")}
          </Button>
          <Button
            size="sm"
            variant={kind === "food" ? "default" : "outline"}
            onClick={() => setKind("food")}
          >
            {t("filterFood")}
          </Button>
          <Button
            size="sm"
            variant={kind === "drink" ? "default" : "outline"}
            onClick={() => setKind("drink")}
          >
            {t("filterDrink")}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTag(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition",
              tag === null
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {t("allTags")}
          </button>
          {MENU_TAGS.map((tg) => {
            const key = menuTagMessageKey(tg);
            return (
              <button
                key={tg}
                type="button"
                onClick={() => setTag(tg === tag ? null : tg)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition",
                  tag === tg
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                {key ? tTag(key) : tg}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
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
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => openRow(row)}
                    className="flex w-full flex-col rounded-2xl border border-border/70 bg-card/50 p-4 text-left transition hover:border-primary/40 hover:bg-card"
                  >
                    <p className="font-medium text-foreground">{row.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.providerName} · {row.sectionTitle}
                      {row.eventTitle ? ` · ${row.eventTitle}` : ""}
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {row.borough} · {row.neighborhood}
                    </p>
                    {price ? (
                      <p className="mt-2 text-sm font-semibold text-primary">
                        {price.main}
                        {price.suffix ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            {price.suffix}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
