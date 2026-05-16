"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/scout/Sidebar";
import { DiscoverView } from "@/components/scout/views/DiscoverView";
import { EventsView } from "@/components/scout/views/EventsView";
import { EventProfile } from "@/components/scout/panels/EventProfile";
import { SavedView } from "@/components/scout/views/SavedView";
import { CalculatorView } from "@/components/scout/views/CalculatorView";
import { SplitCheckView } from "@/components/scout/views/SplitCheckView";
import { ScoutAssistantView } from "@/components/scout/views/ScoutAssistantView";
import { MeetupGroupsView } from "@/components/scout/views/MeetupGroupsView";
import { HomeView } from "@/components/scout/views/HomeView";
import { MyAccountView } from "@/components/scout/views/MyAccountView";
import { EatDrinkView } from "@/components/scout/views/EatDrinkView";
import { TourView } from "@/components/scout/views/TourView";
import { ProviderProfile } from "@/components/scout/panels/ProviderProfile";
import { ShareDialog } from "@/components/scout/panels/ShareDialog";
import { MeetupGroupProfile } from "@/components/scout/panels/MeetupGroupProfile";
import { MeetupShareDialog } from "@/components/scout/panels/MeetupShareDialog";
import { TrustStrip } from "@/components/scout/TrustStrip";
import { Logo } from "@/components/scout/Logo";
import type { Provider, Category } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { MeetupGroup } from "@/types/meetup";
import { Menu, Heart, Bell, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { findProviderByVenueKey } from "@/lib/providerLocale";
import { findEventByKey } from "@/lib/eventLocale";
import { useSaved, useCalculator } from "@/store/useScout";
import {
  useEventsCatalog,
  useMeetupGroupsCatalog,
  useProvidersCatalog,
  useSiteCatalog,
} from "@/hooks/useCatalog";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { CurrencySwitcher } from "@/components/i18n/CurrencySwitcher";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";

const DISCOVER_VIEWS: Category[] = [
  "Venues",
  "Parties",
  "Restaurants",
  "Cafés",
];

export default function BudapestNightShell() {
  const t = useTranslations("nav");
  const tf = useTranslations("footer");
  const {
    view,
    location,
    venueId,
    groupId,
    tourId,
    tourSeed,
    eventId,
    navigateToView,
    openVenue,
    closeVenue,
    openEvent,
    closeEvent,
    openGroup,
    closeGroup,
  } = useAppNavigation();

  const [openProvider, setOpenProvider] = useState<Provider | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<PublicNightEvent | null>(null);
  const [shareProvider, setShareProvider] = useState<Provider | null>(null);
  const [openGroupState, setOpenGroupState] = useState<MeetupGroup | null>(
    null,
  );
  const [shareGroup, setShareGroup] = useState<MeetupGroup | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const { saved } = useSaved();
  const { items } = useCalculator();
  const { data: site } = useSiteCatalog();
  const { data: providers = [] } = useProvidersCatalog();
  const { data: events = [] } = useEventsCatalog();
  const { data: groups = [] } = useMeetupGroupsCatalog();

  useEffect(() => {
    if (!venueId) {
      setOpenProvider(null);
      return;
    }
    const match = venueId
      ? findProviderByVenueKey(providers, venueId)
      : undefined;
    setOpenProvider(match ?? null);
  }, [venueId, providers]);

  useEffect(() => {
    if (!groupId) {
      setOpenGroupState(null);
      return;
    }
    const match = groups.find((g) => g.id === groupId);
    setOpenGroupState(match ?? null);
  }, [groupId, groups]);

  useEffect(() => {
    if (!eventId) {
      setSelectedEvent(null);
      return;
    }
    const match = findEventByKey(events, eventId);
    setSelectedEvent(match ?? null);
  }, [eventId, events]);

  const discoverKey = location
    ? `${location.borough ?? ""}-${location.neighborhood ?? ""}`
    : "all";

  const initialBorough = location?.borough ?? "All";
  const initialNeighborhood =
    location?.borough && location.borough !== "All"
      ? (location.neighborhood ?? null)
      : null;

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        active={view}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
        logoUrl={site?.logoUrl}
        sidebarPromo={undefined}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-background px-4 py-3 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label={t("openMenu")}
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link
              href="/"
              className="flex items-center gap-3 rounded-full transition-opacity hover:opacity-80"
              aria-label={t("goHome")}
            >
              <Logo logoUrl={site?.logoUrl} withWordmark={false} size={48} />
              <span className="font-display text-base font-bold tracking-widest text-foreground sm:text-lg">
                {t("brand")}
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={buildPathForView("Saved")}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:border-foreground/40"
              aria-label={t("saved")}
            >
              <Heart className="h-4 w-4" />
              {saved.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {saved.length}
                </span>
              )}
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:border-foreground/40"
              aria-label={t("notifications")}
            >
              <Bell className="h-4 w-4" />
            </button>
            <Link
              href={buildPathForView("Calculator")}
              className="relative hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:border-foreground/40 hover:text-foreground sm:flex"
            >
              {t("budget")}
              {items.length > 0 && (
                <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold tabular-nums text-primary-foreground">
                  {items.length}
                </span>
              )}
            </Link>
            <ThemeToggle />
            <CurrencySwitcher variant="header" />
            <LocaleSwitcher variant="header" />
            <Link
              href={buildPathForView("My Account")}
              className={`grid h-10 w-10 place-items-center rounded-full border text-foreground hover:border-foreground/40 ${
                view === "My Account"
                  ? "border-foreground bg-primary text-primary-foreground"
                  : "border-border bg-card"
              }`}
              aria-label={t("myAccount")}
            >
              <UserCircle className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-[1400px] animate-fade-in">
            {view === "Home" && (
              <HomeView
                onNavigate={navigateToView}
                onOpenProvider={openVenue}
                onOpenGroup={openGroup}
              />
            )}
            {view === "Events" && (
              <EventsView
                key={`events-${discoverKey}`}
                onOpen={openEvent}
                initialBorough={initialBorough}
                initialNeighborhood={initialNeighborhood}
              />
            )}
            {DISCOVER_VIEWS.includes(view as Category) && (
              <DiscoverView
                key={`${view}-${discoverKey}`}
                category={view as Category}
                onOpen={openVenue}
                onShare={setShareProvider}
                initialBorough={initialBorough}
                initialNeighborhood={initialNeighborhood}
              />
            )}
            {view === "Saved" && (
              <SavedView onOpen={openVenue} onShare={setShareProvider} />
            )}
            {view === "Calculator" && <CalculatorView />}
            {view === "Split Check" && <SplitCheckView />}
            {view === "Scout AI Assistant" && <ScoutAssistantView />}
            {view === "Meet-Up Groups" && (
              <MeetupGroupsView onOpen={openGroup} onShare={setShareGroup} />
            )}
            {view === "Eat & Drink" && !tourId && (
              <EatDrinkView onOpen={openVenue} />
            )}
            {view === "Eat & Drink" && tourId && (
              <TourView tourId={tourId} seed={tourSeed} onOpen={openVenue} />
            )}
            {view === "My Account" && (
              <MyAccountView
                onNavigate={navigateToView}
                onOpenProvider={openVenue}
                onShareProvider={setShareProvider}
              />
            )}
            {view !== "Home" && <TrustStrip />}
            <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
              {t("brand")} · {tf("tagline")} ·{" "}
              <Link
                href="/admin"
                className="text-foreground underline hover:text-foreground/90"
              >
                {tf("admin")}
              </Link>
            </footer>
          </div>
        </main>
      </div>

      <ProviderProfile
        provider={openProvider}
        onClose={closeVenue}
        onShare={setShareProvider}
        onOpenAnother={openVenue}
        onOpenEvent={openEvent}
      />
      <EventProfile
        event={selectedEvent}
        onClose={closeEvent}
        onOpenVenue={openVenue}
      />
      <ShareDialog
        provider={shareProvider}
        onClose={() => setShareProvider(null)}
      />
      <MeetupGroupProfile
        group={openGroupState}
        onClose={closeGroup}
        onShare={setShareGroup}
        onOpenAnother={openGroup}
      />
      <MeetupShareDialog
        group={shareGroup}
        onClose={() => setShareGroup(null)}
      />
    </div>
  );
}
