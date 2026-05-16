"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSiteCatalog } from "@/hooks/useCatalog";
import { CMS_MEDIA, guideImageForId } from "@/config/defaultMedia";
import type { AppLocale } from "@/i18n/config";
import type {
  SiteAccountSettings,
  SiteCalculatorCopy,
  SiteGuide,
  SiteHowStep,
  SiteTrustPillar,
} from "@/types/site";
import { DEFAULT_SITE } from "@/types/site";

function withDistinctGuideImages(guides: SiteGuide[]): SiteGuide[] {
  const generic = CMS_MEDIA.guideCard;
  return guides.map((g) => {
    const url = g.imageUrl?.trim();
    const useDistinct = !url || url === generic;
    return { ...g, imageUrl: useDistinct ? guideImageForId(g.id) : url };
  });
}

/** English may use CMS overrides; all other locales use message files only. */
function useEnglishCms<T>(cmsValue: T | undefined, localized: T): T {
  const locale = useLocale() as AppLocale;
  if (locale === "en" && cmsValue !== undefined) return cmsValue;
  return localized;
}

export function useCalculatorCopy(): SiteCalculatorCopy {
  const t = useTranslations("calculator");
  const { data: site } = useSiteCatalog();

  const localized: SiteCalculatorCopy = {
    title: t("title"),
    subtitle: t("subtitle"),
    clearAllCta: t("clearAllCta"),
    emptyTitle: t("emptyTitle"),
    emptyMessage: t("emptyMessage"),
    asideTitle: t("asideTitle"),
    asideSubtitle: t("asideSubtitle"),
    asideFootnote: t("asideFootnote"),
    providerLinePriceSuffix: t("providerLinePriceSuffix"),
    estimatedTotalLabel: t("estimatedTotalLabel"),
  };

  return useEnglishCms(site?.calculator, localized);
}

export function useTrustPillars(): SiteTrustPillar[] {
  const t = useTranslations("trust");
  const { data: site } = useSiteCatalog();
  const localized = t.raw("pillars") as SiteTrustPillar[];
  return useEnglishCms(site?.trustPillars, localized);
}

export function useAccountCopy(): SiteAccountSettings {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("account");
  const { data: site } = useSiteCatalog();

  if (locale === "en" && site?.account) return site.account;

  const localized = t.raw("settings") as SiteAccountSettings | undefined;
  return localized ?? DEFAULT_SITE.account;
}

export type HomeCopy = {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  heroTagline: string;
  heroImageAlt: string;
  categoriesTitle: string;
  exploreCta: string;
  categories: {
    events: { description: string };
    parties: { description: string };
    restaurants: { description: string };
    cafes: { description: string };
    culture: { description: string };
  };
  neighborhoodSectionTitle: string;
  popularNeighborhoodsCaption: string;
  allDistrictsHint: string;
  openDiscoverAll: string;
  viewAllNeighborhoods: string;
  guidesSectionTitle: string;
  guidesViewAllLabel: string;
  guideCtaDefault: string;
  howItWorksSectionTitle: string;
  popularPicksSectionTitle: string;
  popularPicksViewAllLabel: string;
  culturePickBadge: string;
  cultureCircleLabel: string;
  freeToJoin: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterFinePrint: string;
  newsletterSuccess: string;
  guides: SiteGuide[];
  howItWorksSteps: SiteHowStep[];
};

export function useHomeCopy(): HomeCopy {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("home");
  const { data: site } = useSiteCatalog();

  const localized: HomeCopy = {
    heroTitle: t("heroTitle"),
    heroSubtitle: t("heroSubtitle"),
    heroPrimaryCta: t("heroPrimaryCta"),
    heroSecondaryCta: t("heroSecondaryCta"),
    heroTagline: t("heroTagline"),
    heroImageAlt: t("heroImageAlt"),
    categoriesTitle: t("categoriesTitle"),
    exploreCta: t("exploreCta"),
    categories: t.raw("categories") as HomeCopy["categories"],
    neighborhoodSectionTitle: t("neighborhoodSectionTitle"),
    popularNeighborhoodsCaption: t("popularNeighborhoodsCaption"),
    allDistrictsHint: t("allDistrictsHint"),
    openDiscoverAll: t("openDiscoverAll"),
    viewAllNeighborhoods: t("viewAllNeighborhoods"),
    guidesSectionTitle: t("guidesSectionTitle"),
    guidesViewAllLabel: t("guidesViewAllLabel"),
    guideCtaDefault: t("guideCtaDefault"),
    howItWorksSectionTitle: t("howItWorksSectionTitle"),
    popularPicksSectionTitle: t("popularPicksSectionTitle"),
    popularPicksViewAllLabel: t("popularPicksViewAllLabel"),
    culturePickBadge: t("culturePickBadge"),
    cultureCircleLabel: t("cultureCircleLabel"),
    freeToJoin: t("freeToJoin"),
    newsletterTitle: t("newsletterTitle"),
    newsletterSubtitle: t("newsletterSubtitle"),
    newsletterPlaceholder: t("newsletterPlaceholder"),
    newsletterCta: t("newsletterCta"),
    newsletterFinePrint: t("newsletterFinePrint"),
    newsletterSuccess: t("newsletterSuccess"),
    guides: withDistinctGuideImages(t.raw("guides") as SiteGuide[]),
    howItWorksSteps: t.raw("howItWorksSteps") as SiteHowStep[],
  };

  if (locale !== "en" || !site) return localized;

  return {
    ...localized,
    heroTitle: site.homeHeroTitle,
    heroSubtitle: site.homeHeroSubtitle,
    heroPrimaryCta: site.homeHeroPrimaryCta,
    heroSecondaryCta: site.homeHeroSecondaryCta,
    heroTagline: site.homeHeroTagline,
    categoriesTitle: site.homeCategoriesTitle,
    neighborhoodSectionTitle: site.neighborhoodSectionTitle,
    popularNeighborhoodsCaption: site.popularNeighborhoodsCaption,
    guidesSectionTitle: site.guidesSectionTitle,
    guidesViewAllLabel: site.guidesViewAllLabel,
    howItWorksSectionTitle: site.howItWorksSectionTitle,
    popularPicksSectionTitle: site.popularPicksSectionTitle,
    popularPicksViewAllLabel: site.popularPicksViewAllLabel,
    newsletterTitle: site.newsletterTitle,
    newsletterSubtitle: site.newsletterSubtitle,
    newsletterPlaceholder: site.newsletterPlaceholder,
    newsletterCta: site.newsletterCta,
    newsletterFinePrint: site.newsletterFinePrint,
    guides: withDistinctGuideImages(site.guides?.length ? site.guides : localized.guides),
    howItWorksSteps: site.howItWorksSteps?.length ? site.howItWorksSteps : localized.howItWorksSteps,
  };
}

export function useDiscoverChrome() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("discover");
  const { data: site } = useSiteCatalog();

  return {
    eyebrow: locale === "en" && site?.discoverEyebrow ? site.discoverEyebrow : t("eyebrow"),
    tagline: locale === "en" && site?.discoverTagline ? site.discoverTagline : t("tagline"),
  };
}
