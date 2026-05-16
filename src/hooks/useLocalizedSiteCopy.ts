"use client";

import { useTranslations } from "next-intl";
import { CMS_MEDIA, guideImageForId } from "@/config/defaultMedia";
import type {
  SiteGuide,
  SiteHowStep,
  SiteTrustPillar,
  SiteCalculatorCopy,
  SiteAccountSettings,
} from "@/types/site";

function withDistinctGuideImages(guides: SiteGuide[]): SiteGuide[] {
  const generic = CMS_MEDIA.guideCard;
  return guides.map((g) => {
    const url = g.imageUrl?.trim();
    const useDistinct = !url || url === generic;
    return { ...g, imageUrl: useDistinct ? guideImageForId(g.id) : url };
  });
}

export function useCalculatorCopy(): SiteCalculatorCopy {
  const t = useTranslations("calculator");
  return {
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
}

export function useTrustPillars(): SiteTrustPillar[] {
  const t = useTranslations("trust");
  return t.raw("pillars") as SiteTrustPillar[];
}

export function useAccountCopy(): SiteAccountSettings {
  const t = useTranslations("account");
  return t.raw("settings") as SiteAccountSettings;
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
  const t = useTranslations("home");
  return {
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
}

export function useDiscoverChrome() {
  const t = useTranslations("discover");
  return {
    eyebrow: t("eyebrow"),
    tagline: t("tagline"),
  };
}
