import { useEffect, useMemo, useState } from "react";
import { Heart, Share2, Plus, Minus, X, Eye, MapPin, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useProvidersCatalog } from "@/hooks/useCatalog";
import { useAccountCopy } from "@/hooks/useLocalizedSiteCopy";
import { useCategoryLabel, useVenueLocationLine } from "@/hooks/useVenueDisplay";
import { useTranslations } from "next-intl";
import { useSaved, useCalculator } from "@/store/useScout";
import type { Provider, BoroughChoice, Category } from "@/types/provider";
import { formatCrowdLabel, formatVenuePrice, venueBudgetUnit } from "@/lib/venueDisplay";
import type { AccountSavedCategoryFilter, SiteAccountSettings } from "@/types/site";
import { CMS_MEDIA } from "@/config/defaultMedia";
import { CdnImage } from "@/components/ui/CdnImage";
import {
  ACCOUNT_PANEL,
  CATEGORY_BADGE,
  FILTER_CHIP_ACTIVE,
  FILTER_CHIP_IDLE,
} from "@/lib/cyberTheme";

interface Props {
  onNavigate: (view: Category | "Saved" | "Calculator" | "Meet-Up Groups", location?: { borough?: BoroughChoice; neighborhood?: string }) => void;
  onOpenProvider: (p: Provider) => void;
  onShareProvider: (p: Provider) => void;
}

function priceUnitLabel(p: Provider, units: SiteAccountSettings["saved"]["priceUnits"]) {
  switch (p.category) {
    case "Parties":
      return units.week;
    case "Restaurants":
      return units.party;
    case "Cafés":
      return units.visit;
    case "Events":
      return units.class;
    default:
      return venueBudgetUnit(p.category);
  }
}

function withSaved(tab: string, savedTabId: string, sectionTabId: string) {
  return tab === savedTabId || tab === sectionTabId;
}

function interpolate(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function MyAccountView({ onNavigate, onOpenProvider, onShareProvider }: Props) {
  const acc = useAccountCopy();
  const tNav = useTranslations("nav");
  const categoryLabel = useCategoryLabel();

  const badgeFor = (cat: string) => {
    switch (cat) {
      case "Events":
        return { label: categoryLabel("Events"), filter: "Events" as const, tone: CATEGORY_BADGE.Events };
      case "Parties":
        return { label: categoryLabel("Parties"), filter: "Parties" as const, tone: CATEGORY_BADGE.Parties };
      case "Restaurants":
        return { label: categoryLabel("Restaurants"), filter: "Restaurants" as const, tone: CATEGORY_BADGE.Restaurants };
      case "Cafés":
        return { label: categoryLabel("Cafés"), filter: "Cafés" as const, tone: CATEGORY_BADGE.Cafés };
      case "Meet-Up Group":
        return { label: tNav("culture"), filter: "Culture" as const, tone: CATEGORY_BADGE.Culture };
      default:
        return { label: cat, filter: "All" as const, tone: CATEGORY_BADGE.default };
    }
  };

  const [tab, setTab] = useState(acc.saved.tabId);
  const [filter, setFilter] = useState<AccountSavedCategoryFilter>("All");
  const { saved, toggle: toggleSaved } = useSaved();
  const { add: addToCalc } = useCalculator();
  const { data: providers = [] } = useProvidersCatalog();

  const savedProviders: Provider[] = useMemo(
    () => providers.filter((p) => saved.includes(p.id)),
    [saved, providers],
  );

  type Item = { kind: "provider"; data: Provider; categoryFilter: AccountSavedCategoryFilter };

  const items: Item[] = useMemo(
    () =>
      savedProviders.map((p) => ({
        kind: "provider" as const,
        data: p,
        categoryFilter: badgeFor(p.category).filter as AccountSavedCategoryFilter,
      })),
    [savedProviders],
  );

  const filtered = filter === "All" ? items : items.filter((i) => i.categoryFilter === filter);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">{acc.page.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{acc.page.subtitle}</p>
      </header>

      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2 border-b border-border">
          {acc.navTabs.map((t) => {
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  document.getElementById(`section-${t.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={cn(
                  "relative whitespace-nowrap px-4 py-3 text-sm font-semibold transition-colors",
                  active ? "text-accent" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
                {active && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </div>
      </div>

      <section
        id={`section-${acc.saved.tabId}`}
        className={cn(ACCOUNT_PANEL, "p-6 sm:p-8", tab !== acc.saved.tabId && "hidden")}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">{acc.saved.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{acc.saved.subtitle}</p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-border bg-card/80 hover:border-accent/40 hover:bg-card"
            onClick={() => onNavigate("Saved")}
          >
            {acc.saved.viewAllCta} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {acc.saved.filterChips.map((c) => {
            const active = c.categoryFilter === filter;
            return (
              <button
                key={c.label}
                onClick={() => setFilter(c.categoryFilter)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? FILTER_CHIP_ACTIVE : FILTER_CHIP_IDLE,
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.length === 0 && (
            <p className="col-span-full rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground">{acc.saved.emptyMessage}</p>
          )}
          {filtered.map((item) => (
            <SavedProviderCard
              key={`p-${item.data.id}`}
              provider={item.data}
              card={acc.saved.card}
              priceUnits={acc.saved.priceUnits}
              onView={() => onOpenProvider(item.data)}
              onShare={() => onShareProvider(item.data)}
              onAddToPlan={() => {
                addToCalc(item.data.id);
                toast.success(interpolate(acc.saved.toastAddedToPlan, { name: item.data.name }));
              }}
              onRemove={() => {
                if (saved.includes(item.data.id)) {
                  toggleSaved(item.data.id);
                  toast(interpolate(acc.saved.toastRemoved, { name: item.data.name }));
                } else {
                  toast(acc.saved.toastSampleRemove);
                }
              }}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityPlanCard acc={acc} tab={tab} onNavigate={onNavigate} providers={providers} />
        <FamilyPreferencesCard acc={acc} tab={tab} />
        <NeighborhoodCard acc={acc} tab={tab} onNavigate={onNavigate} />
        <AlertsCard acc={acc} tab={tab} />
      </div>

      <div className={cn(ACCOUNT_PANEL, "rounded-2xl px-6 py-5 text-center")}>
        <p className="text-sm font-medium text-foreground">{acc.privacy.headline}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {acc.privacy.supportTextBefore}{" "}
          <a href={`mailto:${acc.privacy.supportEmail}`} className="font-semibold text-accent hover:underline">
            {acc.privacy.supportEmail}
          </a>
          {acc.privacy.supportTextAfter ? ` ${acc.privacy.supportTextAfter}` : null}
        </p>
      </div>
    </div>
  );
}

function SavedProviderCard({
  provider,
  card,
  priceUnits,
  onView,
  onShare,
  onAddToPlan,
  onRemove,
}: {
  provider: Provider;
  card: SiteAccountSettings["saved"]["card"];
  priceUnits: SiteAccountSettings["saved"]["priceUnits"];
  onView: () => void;
  onShare: () => void;
  onAddToPlan: () => void;
  onRemove: () => void;
}) {
  const tNav = useTranslations("nav");
  const categoryLabel = useCategoryLabel();
  const locationLine = useVenueLocationLine();
  const badgeFor = (cat: string) => {
    switch (cat) {
      case "Events":
        return { label: categoryLabel("Events"), tone: CATEGORY_BADGE.Events };
      case "Parties":
        return { label: categoryLabel("Parties"), tone: CATEGORY_BADGE.Parties };
      case "Restaurants":
        return { label: categoryLabel("Restaurants"), tone: CATEGORY_BADGE.Restaurants };
      case "Cafés":
        return { label: categoryLabel("Cafés"), tone: CATEGORY_BADGE.Cafés };
      case "Meet-Up Group":
        return { label: tNav("culture"), tone: CATEGORY_BADGE.Culture };
      default:
        return { label: cat, tone: CATEGORY_BADGE.default };
    }
  };
  const b = badgeFor(provider.category);
  const unit = priceUnitLabel(provider, priceUnits);
  const price = formatVenuePrice(provider);
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card">
      <div className="relative h-36 overflow-hidden bg-muted">
        <CdnImage
          fill
          resolveBase={provider.website}
          src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
          alt={provider.name}
        />
        <span className={cn("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm", b.tone)}>
          {b.label}
        </span>
        <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/95 text-primary shadow-sm" aria-label="Saved">
          <Heart className="h-4 w-4 fill-primary" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-base font-semibold leading-snug text-foreground">{provider.name}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{locationLine(provider.borough, provider.neighborhood)}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatCrowdLabel(provider.ageRanges[0])} · {provider.activityTypes[0]}
        </p>
        <p className="mt-2 text-sm font-bold text-primary">
          {price.main}
          {price.suffix ? (
            <span className="text-[11px] font-normal text-muted-foreground">{price.suffix}</span>
          ) : (
            <span className="text-[11px] font-normal text-muted-foreground"> · per {unit}</span>
          )}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="rounded-full" onClick={onView}>
            <Eye className="h-3.5 w-3.5" /> {card.viewCta}
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={onShare}>
            <Share2 className="h-3.5 w-3.5" /> {card.shareCta}
          </Button>
          <Button size="sm" className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={onAddToPlan}>
            <Plus className="h-3.5 w-3.5" /> {card.addToPlanCta}
          </Button>
          <Button size="sm" variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" onClick={onRemove}>
            <X className="h-3.5 w-3.5" /> {card.removeCta}
          </Button>
        </div>
      </div>
    </article>
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
  const { items, setClasses, remove, clear } = useCalculator();
  const visible = withSaved(tab, acc.saved.tabId, acc.activityPlan.tabId);

  const rows = useMemo(() => {
    return items
      .map((i) => {
        const p = providers.find((x) => x.id === i.providerId);
        if (!p) return null;
        return { providerId: i.providerId, provider: p, qty: i.classes, subtotal: p.pricePerClass * i.classes };
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
  }, [items, providers]);

  const total = rows.reduce((s, r) => s + r.subtotal, 0);
  const units = acc.activityPlan.priceUnits;

  return (
    <section
      id={`section-${acc.activityPlan.tabId}`}
      className={cn(ACCOUNT_PANEL, "p-6 sm:p-7", !visible && "hidden")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">{acc.activityPlan.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{acc.activityPlan.subtitle}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground">{acc.activityPlan.emptyMessage}</p>
      ) : (
        <>
          <ul className="mt-5 space-y-2">
            {rows.map((r) => {
              const unit = priceUnitLabel(r.provider, units);
              const linePrice = formatVenuePrice(r.provider);
              return (
                <li key={r.providerId} className="flex items-center justify-between gap-3 rounded-2xl bg-card p-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm font-semibold text-foreground">{r.provider.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {linePrice.suffix ? `${linePrice.main}${linePrice.suffix}` : `${linePrice.main} · per ${unit}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-full border border-border">
                      <button
                        type="button"
                        onClick={() => setClasses(r.providerId, r.qty - 1)}
                        className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                        aria-label="Fewer guests"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{r.qty}</span>
                      <button
                        type="button"
                        onClick={() => setClasses(r.providerId, r.qty + 1)}
                        className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                        aria-label="More guests"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="w-16 text-right text-sm font-bold text-primary">€{r.subtotal}</p>
                    <button
                      type="button"
                      onClick={() => remove(r.providerId)}
                      className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
                      aria-label="Remove"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-card p-4">
            <span className="font-display text-sm font-semibold text-foreground">{acc.activityPlan.estimatedTotalLabel}</span>
            <span className="font-display text-2xl font-bold text-primary">€{total}</span>
          </div>
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => onNavigate("Calculator")} className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
          {acc.activityPlan.viewFullCta}
        </Button>
        <Button variant="outline" onClick={() => clear()} className="rounded-full">
          {acc.activityPlan.clearCta}
        </Button>
      </div>
    </section>
  );
}

function PillToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? FILTER_CHIP_ACTIVE : FILTER_CHIP_IDLE,
      )}
    >
      {label}
    </button>
  );
}

function FamilyPreferencesCard({ acc, tab }: { acc: SiteAccountSettings; tab: string }) {
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
    <section
      id={`section-${acc.familyPreferences.tabId}`}
      className={cn(ACCOUNT_PANEL, "p-6 sm:p-7", !visible && "hidden")}
    >
      <h2 className="font-display text-xl font-bold text-foreground">{acc.familyPreferences.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{acc.familyPreferences.subtitle}</p>

      <div className="mt-5 space-y-5">
        {sections.map((sec) => (
          <div key={sec.id}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{sec.label}</p>
            <div className="flex flex-wrap gap-2">
              {sec.options.map((a) => (
                <PillToggle
                  key={a}
                  label={a}
                  active={(sel[sec.id] ?? []).includes(a)}
                  onClick={() => toggle(sec.id, sel[sec.id] ?? [], a)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button
        className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => toast.success(acc.familyPreferences.savedToast)}
      >
        {acc.familyPreferences.editCta}
      </Button>
    </section>
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
    <section id={`section-${n.tabId}`} className={cn(ACCOUNT_PANEL, "p-6 sm:p-7", !visible && "hidden")}>
      <h2 className="font-display text-xl font-bold text-foreground">{n.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{n.subtitle}</p>

      <div className="mt-5 rounded-2xl bg-card p-5">
        <div className="flex flex-wrap items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
            <MapPin className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-foreground">{n.addressLine1}</p>
            <p className="text-sm text-muted-foreground">{n.addressLine2}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {n.detectedLabelPrefix}{" "}
              <span className="font-semibold text-foreground">{n.detectedNeighborhood}</span> · {n.detectedBorough}
            </p>
          </div>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => toast(n.updateAddressToast)}>
            {n.updateAddressCtaLabel}
          </Button>
        </div>
      </div>

      <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{n.nearbySectionLabel}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {n.nearbyNeighborhoods.map((hood) => (
          <button
            key={hood}
            type="button"
            onClick={() => onNavigate("Events", { borough: n.nearbyNavigateBorough, neighborhood: hood })}
            className="rounded-full border border-border bg-card/80 px-3.5 py-1.5 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            {hood}
          </button>
        ))}
      </div>

      <Button
        className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => onNavigate("Events", { borough: n.browseNavigateBorough, neighborhood: n.browseNavigateNeighborhood })}
      >
        {n.browseCtaLabel} <ArrowRight className="h-4 w-4" />
      </Button>
    </section>
  );
}

function AlertsCard({ acc, tab }: { acc: SiteAccountSettings; tab: string }) {
  const visible = withSaved(tab, acc.saved.tabId, acc.alerts.tabId);
  const a = acc.alerts;

  const [alerts, setAlerts] = useState<Record<string, boolean>>(() => Object.fromEntries(a.options.map((x) => [x, true])));
  useEffect(() => {
    setAlerts(Object.fromEntries(a.options.map((x) => [x, true])));
  }, [a.options]);

  const [freq, setFreq] = useState(a.frequencyChoices[0] ?? "Weekly");
  useEffect(() => {
    setFreq(a.frequencyChoices[0] ?? "Weekly");
  }, [a.frequencyChoices]);

  return (
    <section id={`section-${a.tabId}`} className={cn(ACCOUNT_PANEL, "p-6 sm:p-7", !visible && "hidden")}>
      <h2 className="font-display text-xl font-bold text-foreground">{a.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{a.subtitle}</p>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{a.emailSectionLabel}</p>
        <ul className="space-y-2">
          {a.options.map((opt) => (
            <li key={opt} className="flex items-center gap-3 rounded-xl bg-card px-3 py-2">
              <Checkbox
                id={`alert-${opt}`}
                checked={alerts[opt] ?? false}
                onCheckedChange={(v) => setAlerts((s) => ({ ...s, [opt]: !!v }))}
                className="data-[state=checked]:border-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
              />
              <label htmlFor={`alert-${opt}`} className="cursor-pointer text-sm text-foreground">
                {opt}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{a.frequencySectionLabel}</p>
        <div className="flex flex-wrap gap-2">
          {a.frequencyChoices.map((f) => {
            const active = f === freq;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFreq(f)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? FILTER_CHIP_ACTIVE : FILTER_CHIP_IDLE,
                )}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <Button className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast.success(a.savedToast)}>
        <Mail className="h-4 w-4" /> {a.saveCta}
      </Button>
    </section>
  );
}
