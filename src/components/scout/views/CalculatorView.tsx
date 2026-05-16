import { useCalculator } from "@/store/useScout";
import { Button } from "@/components/ui/button";
import { Calculator, Minus, Plus, Trash2, X, Loader2, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import { EmptyState } from "../EmptyState";
import { CdnImage } from "@/components/ui/CdnImage";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useCalculatorCopy } from "@/hooks/useLocalizedSiteCopy";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { formatVenuePrice } from "@/lib/venueDisplay";
import { useVenueLocationLine } from "@/hooks/useVenueDisplay";

export function CalculatorView() {
  const t = useTranslations("calculator");
  const ts = useTranslations("split");
  const c = useCalculatorCopy();
  const { items, setClasses, remove, clear } = useCalculator();
  const { data: providers = [], isLoading } = useProvidersCatalog();
  const locationLine = useVenueLocationLine();

  const rows = items
    .map((i) => {
      const p = providers.find((x) => x.id === i.providerId);
      if (!p) return null;
      return { ...i, provider: p, subtotal: p.pricePerClass * i.classes };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const total = rows.reduce((sum, r) => sum + r.subtotal, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">{c.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{c.subtitle}</p>
        </div>
        {rows.length > 0 && (
          <Button variant="outline" onClick={clear}>
            <Trash2 className="h-4 w-4" /> {c.clearAllCta}
          </Button>
        )}
      </header>

      {rows.length === 0 ? (
        <EmptyState icon={Calculator} title={c.emptyTitle} message={c.emptyMessage} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {rows.map((r) => {
              const linePrice = formatVenuePrice(r.provider);
              return (
              <div className="flex items-center gap-4 rounded-2xl bg-card p-4 shadow-card" key={r.providerId}>
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <CdnImage
                    fill
                    resolveBase={r.provider.website}
                    src={r.provider.image?.trim() ? r.provider.image : CMS_MEDIA.fallbackListing}
                    alt=""
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display font-semibold text-foreground">{r.provider.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {locationLine(r.provider.borough, r.provider.neighborhood)} · {linePrice.main}
                    {linePrice.suffix ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
                  <button
                    onClick={() => setClasses(r.providerId, r.classes - 1)}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                    aria-label={t("decreaseGuests")}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{r.classes}</span>
                  <button
                    onClick={() => setClasses(r.providerId, r.classes + 1)}
                    className="grid h-7 w-7 place-items-center rounded-full hover:bg-secondary"
                    aria-label={t("increaseGuests")}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="w-20 text-right font-display font-bold text-orange">€{r.subtotal}</div>
                <button
                  onClick={() => remove(r.providerId)}
                  aria-label={t("remove", { name: r.provider.name })}
                  className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl bg-card p-6 shadow-card lg:sticky lg:top-6">
            <h3 className="font-display text-base font-semibold text-foreground">{c.asideTitle}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{c.asideSubtitle}</p>
            <div className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
              {rows.map((r) => (
                <div key={r.providerId} className="flex justify-between">
                  <span className="truncate pr-2 text-muted-foreground">
                    {r.provider.name} × {r.classes} {r.classes === 1 ? t("guest") : t("guests")}
                  </span>
                  <span className="font-medium text-foreground">€{r.subtotal}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="font-display text-sm font-semibold text-foreground">{c.estimatedTotalLabel}</span>
              <span className="font-display text-3xl font-bold text-orange">€{total}</span>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{c.asideFootnote}</p>
            {total > 0 && (
              <Button
                asChild
                className="mt-4 w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href={buildPathForView("Split Check")}>
                  <Users className="h-4 w-4" /> {ts("fromBudgetCta")}
                </Link>
              </Button>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
