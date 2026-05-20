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
  const tCalc = useTranslations("calculator");
  return {
    title: tCalc("title"),
    subtitle: tCalc("subtitle"),
    clearAllCta: tCalc("clearAllCta"),
    emptyTitle: tCalc("emptyTitle"),
    emptyMessage: tCalc("emptyMessage"),
    asideTitle: tCalc("asideTitle"),
    asideSubtitle: tCalc("asideSubtitle"),
    asideFootnote: tCalc("asideFootnote"),
    providerLinePriceSuffix: tCalc("providerLinePriceSuffix"),
    estimatedTotalLabel: tCalc("estimatedTotalLabel"),
  };
}

export function useTrustPillars(): SiteTrustPillar[] {
  const tTrust = useTranslations("trust");
  return tTrust.raw("pillars") as SiteTrustPillar[];
}

export function useAccountCopy(): SiteAccountSettings {
  const tAccount = useTranslations("account");
  return tAccount.raw("settings") as SiteAccountSettings;
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
    venues: { description: string };
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
  guides: SiteGuide[];
  howItWorksSteps: SiteHowStep[];
};

export function useHomeCopy(): HomeCopy {
  const tHome = useTranslations("home");
  return {
    heroTitle: tHome("heroTitle"),
    heroSubtitle: tHome("heroSubtitle"),
    heroPrimaryCta: tHome("heroPrimaryCta"),
    heroSecondaryCta: tHome("heroSecondaryCta"),
    heroTagline: tHome("heroTagline"),
    heroImageAlt: tHome("heroImageAlt"),
    categoriesTitle: tHome("categoriesTitle"),
    exploreCta: tHome("exploreCta"),
    categories: tHome.raw("categories") as HomeCopy["categories"],
    neighborhoodSectionTitle: tHome("neighborhoodSectionTitle"),
    popularNeighborhoodsCaption: tHome("popularNeighborhoodsCaption"),
    allDistrictsHint: tHome("allDistrictsHint"),
    openDiscoverAll: tHome("openDiscoverAll"),
    viewAllNeighborhoods: tHome("viewAllNeighborhoods"),
    guidesSectionTitle: tHome("guidesSectionTitle"),
    guidesViewAllLabel: tHome("guidesViewAllLabel"),
    guideCtaDefault: tHome("guideCtaDefault"),
    howItWorksSectionTitle: tHome("howItWorksSectionTitle"),
    popularPicksSectionTitle: tHome("popularPicksSectionTitle"),
    popularPicksViewAllLabel: tHome("popularPicksViewAllLabel"),
    culturePickBadge: tHome("culturePickBadge"),
    cultureCircleLabel: tHome("cultureCircleLabel"),
    freeToJoin: tHome("freeToJoin"),
    guides: withDistinctGuideImages(tHome.raw("guides") as SiteGuide[]),
    howItWorksSteps: tHome.raw("howItWorksSteps") as SiteHowStep[],
  };
}

export function useDiscoverChrome() {
  const tDiscover = useTranslations("discover");
  return {
    eyebrow: tDiscover("eyebrow"),
    tagline: tDiscover("tagline"),
  };
}
