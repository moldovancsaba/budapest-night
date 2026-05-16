import { CMS_MEDIA, guideImageForId } from "@/config/defaultMedia";
import { DEFAULT_SITE, type SiteAccountSettings, type SiteCalculatorCopy, type SiteDoc } from "@/types/site";

function mergeCalculator(base: SiteCalculatorCopy, patch: Partial<SiteCalculatorCopy> | undefined): SiteCalculatorCopy {
  if (!patch) return base;
  return { ...base, ...patch };
}

function mergeAccount(base: SiteAccountSettings, patch: Partial<SiteAccountSettings> | undefined): SiteAccountSettings {
  if (!patch) return base;
  return {
    ...base,
    ...patch,
    page: { ...base.page, ...patch.page },
    navTabs: patch.navTabs?.length ? patch.navTabs : base.navTabs,
    saved: {
      ...base.saved,
      ...patch.saved,
      filterChips: patch.saved?.filterChips?.length ? patch.saved.filterChips : base.saved.filterChips,
      card: { ...base.saved.card, ...patch.saved?.card },
      priceUnits: { ...base.saved.priceUnits, ...patch.saved?.priceUnits },
    },
    activityPlan: {
      ...base.activityPlan,
      ...patch.activityPlan,
      priceUnits: { ...base.activityPlan.priceUnits, ...patch.activityPlan?.priceUnits },
    },
    familyPreferences: {
      ...base.familyPreferences,
      ...patch.familyPreferences,
      sections: patch.familyPreferences?.sections?.length
        ? patch.familyPreferences.sections
        : base.familyPreferences.sections,
    },
    neighborhood: { ...base.neighborhood, ...patch.neighborhood },
    alerts: {
      ...base.alerts,
      ...patch.alerts,
      options: patch.alerts?.options?.length ? patch.alerts.options : base.alerts.options,
      frequencyChoices: patch.alerts?.frequencyChoices?.length ? patch.alerts.frequencyChoices : base.alerts.frequencyChoices,
    },
    privacy: { ...base.privacy, ...patch.privacy },
  };
}

/** Merge a partial Mongo `site` document with defaults so the client always receives a full `SiteDoc`. */
export function mergeSiteDocument(doc: Partial<SiteDoc> | null | undefined): SiteDoc {
  if (!doc) return { _id: "main", ...DEFAULT_SITE };
  const { _id, account: accountPatch, calculator: calculatorPatch, ...rest } = doc as SiteDoc & {
    _id?: unknown;
    account?: Partial<SiteAccountSettings>;
    calculator?: Partial<SiteCalculatorCopy>;
  };
  const merged = { _id: "main" as const, ...DEFAULT_SITE, ...rest } as SiteDoc;
  merged.account = mergeAccount(DEFAULT_SITE.account, accountPatch);
  merged.calculator = mergeCalculator(DEFAULT_SITE.calculator, calculatorPatch);
  if (!merged.homeHeroUrl?.trim()) merged.homeHeroUrl = DEFAULT_SITE.homeHeroUrl;
  if (!merged.discoverHeroUrl?.trim()) merged.discoverHeroUrl = DEFAULT_SITE.discoverHeroUrl;
  if (!merged.guides?.length) merged.guides = DEFAULT_SITE.guides;
  else {
    const generic = CMS_MEDIA.guideCard;
    merged.guides = merged.guides.map((g) => {
      const url = g.imageUrl?.trim();
      const useDistinct = !url || url === generic;
      return { ...g, imageUrl: useDistinct ? guideImageForId(g.id) : url };
    });
  }
  return merged;
}
