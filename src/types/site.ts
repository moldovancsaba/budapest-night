import type { Borough } from "@/types/provider";
import { APP_LOGO_PATH } from "@/config/brand";
import { CMS_MEDIA, guideImageForId } from "@/config/defaultMedia";

/** Lucide icon keys used by home marketing blocks (stored in Mongo). */
export type SiteIconKey =
  | "map-pin"
  | "list-checks"
  | "heart"
  | "shield-check"
  | "compass"
  | "users"
  | "calculator";

export type SiteTone = "orange" | "teal" | "pink" | "amber" | "blue";

export interface SiteGuide {
  /** Stable id for React keys and ingest; falls back to title if omitted. */
  id?: string;
  title: string;
  desc: string;
  borough: Borough;
  neighborhood: string;
  imageUrl: string;
  tone: SiteTone;
  /** CTA under the card; default "Explore guide" in UI when empty. */
  ctaLabel?: string;
  /** If set, card navigates here (http(s) opens new tab; otherwise treated as in-app path or hash). */
  ctaHref?: string;
}

export interface SiteHowStep {
  step: number;
  title: string;
  desc: string;
  tone: SiteTone;
  icon: SiteIconKey;
}

export interface SiteTrustPillar {
  title: string;
  desc: string;
  tone: SiteTone;
  icon: SiteIconKey;
}

/** Saved-tab filter chip; `categoryFilter` must match `badgeFor(provider).filter` / meetup row. */
export type AccountSavedCategoryFilter = "All" | "Events" | "Parties" | "Restaurants" | "Cafés" | "Culture";

export interface SiteAccountSavedFilterChip {
  label: string;
  categoryFilter: AccountSavedCategoryFilter;
}

export interface SiteAccountPreferenceSection {
  id: string;
  label: string;
  options: string[];
  defaultSelected: string[];
}

export interface SiteAccountNeighborhoodCard {
  tabId: string;
  title: string;
  subtitle: string;
  addressLine1: string;
  addressLine2: string;
  detectedLabelPrefix: string;
  detectedNeighborhood: string;
  detectedBorough: Borough;
  updateAddressCtaLabel: string;
  nearbySectionLabel: string;
  nearbyNeighborhoods: string[];
  /** Borough used when a nearby chip navigates to Discover. */
  nearbyNavigateBorough: Borough;
  browseCtaLabel: string;
  browseNavigateBorough: Borough;
  browseNavigateNeighborhood: string;
  /** Toast when “Update address” is tapped (placeholder until geocoding ships). */
  updateAddressToast: string;
}

export interface SiteAccountSettings {
  page: { title: string; subtitle: string };
  navTabs: { id: string; label: string }[];
  saved: {
    tabId: string;
    title: string;
    subtitle: string;
    viewAllCta: string;
    filterChips: SiteAccountSavedFilterChip[];
    emptyMessage: string;
    card: { viewCta: string; shareCta: string; addToPlanCta: string; removeCta: string };
    toastAddedToPlan: string;
    toastRemoved: string;
    toastSampleRemove: string;
    /** Per-category budget line unit (Events→ticket, Parties→cover, etc.). */
    priceUnits: { class: string; week: string; party: string; visit: string };
  };
  activityPlan: {
    tabId: string;
    title: string;
    subtitle: string;
    emptyMessage: string;
    estimatedTotalLabel: string;
    viewFullCta: string;
    clearCta: string;
    /** Label after unit price on the account plan preview (same semantics as Discover). */
    priceUnits: { class: string; week: string; party: string; visit: string };
  };
  familyPreferences: {
    tabId: string;
    title: string;
    subtitle: string;
    editCta: string;
    /** Toast after tapping edit/save preferences. */
    savedToast: string;
    sections: SiteAccountPreferenceSection[];
  };
  neighborhood: SiteAccountNeighborhoodCard;
  alerts: {
    tabId: string;
    title: string;
    subtitle: string;
    emailSectionLabel: string;
    options: string[];
    frequencySectionLabel: string;
    frequencyChoices: string[];
    saveCta: string;
    savedToast: string;
  };
  privacy: {
    headline: string;
    supportTextBefore: string;
    supportEmail: string;
    supportTextAfter: string;
  };
}

export interface SiteCalculatorCopy {
  title: string;
  subtitle: string;
  clearAllCta: string;
  emptyTitle: string;
  emptyMessage: string;
  asideTitle: string;
  asideSubtitle: string;
  asideFootnote: string;
  /** Appended to price in budget rows (e.g. "/person"). */
  providerLinePriceSuffix: string;
  estimatedTotalLabel: string;
}

export interface SiteDoc {
  _id: "main";
  logoUrl: string;
  homeHeroUrl: string;
  discoverHeroUrl: string;
  homeHeroTitle: string;
  homeHeroSubtitle: string;
  homeHeroPrimaryCta: string;
  homeHeroSecondaryCta: string;
  homeHeroTagline: string;
  /** Discover category pages — eyebrow + closing tagline (category line is built in UI). */
  discoverEyebrow: string;
  discoverTagline: string;
  homeCategoriesTitle: string;
  neighborhoodSectionTitle: string;
  /** Use {"{district}"} as placeholder for the selected district name. */
  popularNeighborhoodsCaption: string;
  guidesSectionTitle: string;
  guidesViewAllLabel: string;
  /** Optional absolute URL; when empty, “View all” uses in-app Discover navigation. */
  guidesViewAllHref?: string;
  guides: SiteGuide[];
  howItWorksSectionTitle: string;
  howItWorksSteps: SiteHowStep[];
  trustPillars: SiteTrustPillar[];
  trustLines: string[];
  popularPicksSectionTitle: string;
  popularPicksViewAllLabel: string;
  newsletterTitle: string;
  newsletterSubtitle: string;
  newsletterPlaceholder: string;
  newsletterCta: string;
  newsletterFinePrint: string;
  sidebarTitle: string;
  sidebarBody: string;
  sidebarCtaLabel: string;
  /** Provider **display names** from the catalog to feature on the home “Popular picks” row (resolved in order). */
  homePopularPickProviderNames: string[];
  /** Optional meet-up `id` from the meetup catalog; empty hides the card. */
  homePopularMeetupGroupId: string;
  calculator: SiteCalculatorCopy;
  /** My Account + related dashboard copy and option lists (CMS). */
  account: SiteAccountSettings;
}

export interface BrainSettingsDoc {
  _id: "main";
  systemPrompt: string;
  model: string;
  starters: string[];
}

export const DEFAULT_BRAIN: Omit<BrainSettingsDoc, "_id"> = {
  systemPrompt: `You are the Budapest Night Guide, a sharp local companion for events, parties, restaurants, cafés, and culture across Budapest.

Help visitors and locals:
- Discover nightlife, dining, and cultural picks by district and neighborhood (Belváros, Terézváros, Erzsébetváros, Ferencváros, Buda, Óbuda, Újbuda).
- Compare venues by vibe, schedule, price, and atmosphere.
- Plan a night out or a culture-heavy weekend.
- Estimate spend across multiple venues.

Tone: energetic, concise, neon-city cool. Use short paragraphs and bullet points. Ask clarifying questions when helpful (district, budget, music vs food vs art). Avoid inventing specific venue names unless the user names one.`,
  model: "google/gemini-3-flash-preview",
  starters: [
    "Ruin bars in the Jewish Quarter tonight",
    "Rooftop restaurants with Danube views",
    "Electronic parties this weekend in Pest",
    "Gallery openings and culture walks near Andrássy út",
  ],
};

export const DEFAULT_SITE: Omit<SiteDoc, "_id"> = {
  logoUrl: APP_LOGO_PATH,
  homeHeroUrl: CMS_MEDIA.homeHero,
  discoverHeroUrl: CMS_MEDIA.discoverHero,
  homeHeroTitle: "Discover Budapest after dark",
  homeHeroSubtitle:
    "Events, parties, restaurants, cafés, and culture — curated by district and neighborhood.",
  homeHeroPrimaryCta: "Start exploring",
  homeHeroSecondaryCta: "Browse by district",
  homeHeroTagline: "Neon-lit. Local. Built for nights out in Budapest.",
  discoverEyebrow: "Budapest after dark",
  discoverTagline: "Curated. Local. Built for nights out.",
  homeCategoriesTitle: "What's your night?",
  neighborhoodSectionTitle: "Find the night in your neighborhood",
  popularNeighborhoodsCaption: "Popular spots in {district}",
  guidesSectionTitle: "Featured district guides",
  guidesViewAllLabel: "View all guides",
  guidesViewAllHref: "",
  guides: [
    {
      id: "guide-belvaros",
      title: "Belváros nightlife & dining",
      desc: "Riverside bars, classic bistros, and late kitchens in the inner city.",
      borough: "Belváros",
      neighborhood: "Inner City",
      imageUrl: guideImageForId("guide-belvaros"),
      tone: "orange",
      ctaLabel: "Explore guide",
    },
    {
      id: "guide-jewish-quarter",
      title: "Jewish Quarter ruin bars",
      desc: "Ruin pubs, street food, and party energy in Erzsébetváros.",
      borough: "Erzsébetváros",
      neighborhood: "Jewish Quarter",
      imageUrl: guideImageForId("guide-jewish-quarter"),
      tone: "teal",
      ctaLabel: "Explore guide",
    },
    {
      id: "guide-andrassy",
      title: "Andrássy culture strip",
      desc: "Galleries, cafés, and elegant nights along Terézváros.",
      borough: "Terézváros",
      neighborhood: "Andrássy út",
      imageUrl: guideImageForId("guide-andrassy"),
      tone: "pink",
      ctaLabel: "Explore guide",
    },
    {
      id: "guide-buda",
      title: "Buda castle & hill views",
      desc: "Castle district wine bars, thermal vibes, and sunset terraces.",
      borough: "Buda",
      neighborhood: "Castle District",
      imageUrl: guideImageForId("guide-buda"),
      tone: "blue",
      ctaLabel: "Explore guide",
    },
  ],
  howItWorksSectionTitle: "How Budapest Night works",
  howItWorksSteps: [
    {
      step: 1,
      title: "Choose your district",
      desc: "Start where you are staying or going out tonight.",
      tone: "orange",
      icon: "map-pin",
    },
    {
      step: 2,
      title: "Compare local options",
      desc: "See vibes, prices, hours, tags, and what makes each spot special.",
      tone: "teal",
      icon: "list-checks",
    },
    {
      step: 3,
      title: "Save, share & plan",
      desc: "Save favorites, share spots with friends, and estimate your night-out budget.",
      tone: "pink",
      icon: "heart",
    },
  ],
  trustPillars: [
    {
      title: "Local by design",
      desc: "Budapest-focused listings organized by district and neighborhood.",
      tone: "orange",
      icon: "compass",
    },
    {
      title: "Helpful details",
      desc: "Hours, vibes, prices, and tags in one place.",
      tone: "teal",
      icon: "shield-check",
    },
    {
      title: "Night-ready",
      desc: "Built for locals and visitors planning the perfect evening.",
      tone: "pink",
      icon: "users",
    },
    {
      title: "Save & compare",
      desc: "Bookmark venues and estimate your total spend.",
      tone: "blue",
      icon: "calculator",
    },
  ],
  trustLines: ["Curated Budapest listings", "District-first search", "Built for nights out"],
  popularPicksSectionTitle: "Neon picks to get you started",
  popularPicksViewAllLabel: "View all",
  newsletterTitle: "Get the latest Budapest night picks for your district",
  newsletterSubtitle: "New events, parties, restaurants, cafés, and culture — in your inbox.",
  newsletterPlaceholder: "Enter your email",
  newsletterCta: "Sign me up!",
  newsletterFinePrint: "No spam. Unsubscribe anytime.",
  sidebarTitle: "List your venue",
  sidebarBody: "Reach night owls and culture seekers with a featured listing.",
  sidebarCtaLabel: "Get in touch",
  homePopularPickProviderNames: ["Szimpla Kert", "New York Café", "A38 Ship"],
  homePopularMeetupGroupId: "grp-budapest-art-walk-terezvaros",
  calculator: {
    title: "Night out budget",
    subtitle: "Estimate your total spend across venues and events.",
    clearAllCta: "Clear all",
    emptyTitle: "Calculator is empty",
    emptyMessage: "Add venues to estimate your night-out budget.",
    asideTitle: "Estimated total",
    asideSubtitle: "Based on the venues and events you've added.",
    asideFootnote: "Estimates for planning only. Confirm rates with each provider.",
    providerLinePriceSuffix: "/person",
    estimatedTotalLabel: "Estimated total",
  },
  account: {
    page: {
      title: "My Account",
      subtitle: "Manage saved venues, your night plan, and preferences.",
    },
    navTabs: [
      { id: "saved", label: "Saved" },
      { id: "plan", label: "Night plan" },
      { id: "prefs", label: "Preferences" },
      { id: "neighborhood", label: "My district" },
      { id: "alerts", label: "Alerts" },
    ],
    saved: {
      tabId: "saved",
      title: "Saved venues & circles",
      subtitle: "Everything you've bookmarked in one place.",
      viewAllCta: "View all saved",
      filterChips: [
        { label: "All", categoryFilter: "All" },
        { label: "Events", categoryFilter: "Events" },
        { label: "Parties", categoryFilter: "Parties" },
        { label: "Restaurants", categoryFilter: "Restaurants" },
        { label: "Cafés", categoryFilter: "Cafés" },
        { label: "Culture", categoryFilter: "Culture" },
      ],
      emptyMessage: "No saved items in this category yet.",
      card: { viewCta: "View", shareCta: "Share", addToPlanCta: "Add to budget", removeCta: "Remove" },
      toastAddedToPlan: "Added {name} to your plan",
      toastRemoved: "Removed {name}",
      toastSampleRemove: "Save venues from Discover to manage them here.",
      priceUnits: { class: "ticket", week: "cover", party: "person", visit: "visit" },
    },
    activityPlan: {
      tabId: "plan",
      title: "My night plan",
      subtitle: "Estimate your total spend for the evening.",
      emptyMessage: "Add venues from Discover to your budget tool to see them here.",
      estimatedTotalLabel: "Estimated total",
      viewFullCta: "View full plan",
      clearCta: "Clear plan",
      priceUnits: { class: "ticket", week: "cover", party: "person", visit: "visit" },
    },
    familyPreferences: {
      tabId: "prefs",
      title: "Your preferences",
      subtitle: "Tune what you want to see around Budapest.",
      editCta: "Edit preferences",
      savedToast: "Preferences saved",
      sections: [
        {
          id: "age",
          label: "Crowd & vibe",
          options: ["All ages", "Family", "18+", "21+", "Late night"],
          defaultSelected: ["18+"],
        },
        {
          id: "interests",
          label: "Interests",
          options: [
            "Events",
            "Parties",
            "Restaurants",
            "Cafés",
            "Culture",
            "Live Music",
            "Ruin Bar",
            "Fine Dining",
            "Gallery",
            "Rooftop",
            "Craft Beer",
            "Electronic",
          ],
          defaultSelected: ["Events", "Parties", "Restaurants", "Cafés", "Culture", "Live Music"],
        },
        {
          id: "times",
          label: "Preferred times",
          options: ["Weekday", "Weekend", "Morning", "Afternoon", "Evening", "Late night"],
          defaultSelected: ["Weekend", "Evening", "Late night"],
        },
      ],
    },
    neighborhood: {
      tabId: "neighborhood",
      title: "My district",
      subtitle: "Your home base for Budapest nights out.",
      addressLine1: "",
      addressLine2: "",
      detectedLabelPrefix: "Your area:",
      detectedNeighborhood: "",
      detectedBorough: "Belváros",
      updateAddressCtaLabel: "Update address",
      nearbySectionLabel: "Nearby neighborhoods",
      nearbyNeighborhoods: [],
      nearbyNavigateBorough: "Belváros",
      browseCtaLabel: "Browse spots near me",
      browseNavigateBorough: "Belváros",
      browseNavigateNeighborhood: "",
      updateAddressToast: "Update address coming soon",
    },
    alerts: {
      tabId: "alerts",
      title: "Alerts & Email Settings",
      subtitle: "Choose what you want to hear about.",
      emailSectionLabel: "Email alerts",
      options: [
        "Weekly district picks",
        "New events near me",
        "Party & club updates",
        "Restaurant openings",
        "Weekend culture picks",
        "New culture circles",
        "Updates from saved venues and groups",
      ],
      frequencySectionLabel: "Email frequency",
      frequencyChoices: ["Weekly", "Only important updates", "Pause emails"],
      saveCta: "Save settings",
      savedToast: "Settings saved",
    },
    privacy: {
      headline: "We respect your privacy. Your information is never shared.",
      supportTextBefore: "Questions? Email us at",
      supportEmail: "hello@budapestnight.com",
      supportTextAfter: "",
    },
  },
};
