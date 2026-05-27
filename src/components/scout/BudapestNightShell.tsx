"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/scout/Sidebar";
import { DiscoverView } from "@/components/scout/views/DiscoverView";
import { EventsView } from "@/components/scout/views/EventsView";
import { EventProfile } from "@/components/scout/panels/EventProfile";
import { SavedView } from "@/components/scout/views/SavedView";
import { CalculatorView } from "@/components/scout/views/CalculatorView";
import { SplitCheckView } from "@/components/scout/views/SplitCheckView";
import { MeetupGroupsView } from "@/components/scout/views/MeetupGroupsView";
import { HomeView } from "@/components/scout/views/HomeView";
import { ProgramWeekView } from "@/components/scout/views/ProgramWeekView";
import { ProgramVerticalView } from "@/components/scout/views/ProgramVerticalView";
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
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import { ActionIcon, Anchor, Badge, Box, Group } from "@mantine/core";
import { DiscoveryAppShell, PublicSiteFooter } from "@/components/gds";
import { useMediaQuery } from "@mantine/hooks";
import { Menu as MenuIcon, Heart, Bell, UserCircle } from "@/components/gds/icons";
import { useLocale, useTranslations } from "next-intl";
import { AppButton } from "@/components/gds/AppButton";
import type { AppLocale } from "@/i18n/config";
import { findProviderByVenueKey, getVenuePathKey } from "@/lib/providerLocale";
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
import { Link, useRouter } from "@/i18n/routing";
import {
  buildPathForView,
  buildSectionPath,
  buildVenueFullPath,
  buildVenuePath,
} from "@/lib/appPaths";
import {
  buildAbsoluteEventFullUrl,
  buildAbsoluteGroupFullUrl,
  buildAbsoluteVenueFullUrl,
} from "@/lib/appShareUrls";
import { ShareablePageChrome } from "@/components/scout/ShareablePageChrome";
import { ShareableMissing } from "@/components/scout/ShareableMissing";
import { ShareablePageLoading } from "@/components/scout/ShareablePageLoading";

const DISCOVER_VIEWS: Category[] = [
  "Venues",
  "Parties",
  "Restaurants",
  "Cafés",
];

export default function BudapestNightShell() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
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
    fullPage,
    route,
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
  const [openGroupState, setOpenGroupState] = useState<PublicMeetupGroup | null>(
    null,
  );
  const [shareGroup, setShareGroup] = useState<PublicMeetupGroup | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const { saved } = useSaved();
  const { items } = useCalculator();
  const { data: site } = useSiteCatalog();
  const { data: providers = [], isLoading: providersLoading } = useProvidersCatalog();
  const { data: events = [], isLoading: eventsLoading } = useEventsCatalog();
  const { data: groups = [], isLoading: groupsLoading } = useMeetupGroupsCatalog();
  const smUp = useMediaQuery("(min-width: 48em)");

  useEffect(() => {
    if (!venueId) {
      setOpenProvider(null);
      return;
    }
    const match = findProviderByVenueKey(providers, venueId);
    setOpenProvider(match ?? null);
  }, [venueId, providers]);

  useEffect(() => {
    if (!venueId || !openProvider) return;
    const canonical = getVenuePathKey(openProvider, locale);
    if (decodeURIComponent(venueId) === canonical) return;
    const opts = {
      from: route.fromSection,
      location: route.location ?? undefined,
      locale,
    };
    router.replace(
      route.fullPage ? buildVenueFullPath(openProvider, opts) : buildVenuePath(openProvider, opts),
    );
  }, [venueId, openProvider, locale, router, route.fromSection, route.location, route.fullPage]);

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

  const backHref = buildSectionPath(route.fromSection, {
    location: route.location ?? undefined,
  });

  if (fullPage) {
    let shareUrl: string | null = null;
    let title: string | undefined;

    if (selectedEvent) {
      shareUrl = buildAbsoluteEventFullUrl(selectedEvent, locale);
      title = selectedEvent.title;
    } else if (openProvider) {
      shareUrl = buildAbsoluteVenueFullUrl(openProvider, locale);
      title = openProvider.name;
    } else if (openGroupState) {
      shareUrl = buildAbsoluteGroupFullUrl(openGroupState.id, locale);
      title = openGroupState.name;
    }

    return (
      <ShareablePageChrome backHref={backHref} shareUrl={shareUrl} title={title} wide>
        {eventId &&
          (selectedEvent ? (
            <EventProfile
              variant="page"
              event={selectedEvent}
              onClose={closeEvent}
              onOpenVenue={openVenue}
            />
          ) : eventsLoading ? (
            <ShareablePageLoading />
          ) : (
            <ShareableMissing backHref={backHref} />
          ))}
        {venueId &&
          !eventId &&
          (openProvider ? (
            <ProviderProfile
              variant="page"
              provider={openProvider}
              onClose={closeVenue}
              onShare={setShareProvider}
              onOpenAnother={openVenue}
              onOpenEvent={openEvent}
            />
          ) : providersLoading ? (
            <ShareablePageLoading />
          ) : (
            <ShareableMissing backHref={backHref} />
          ))}
        {groupId &&
          !eventId &&
          !venueId &&
          (openGroupState ? (
            <MeetupGroupProfile
              variant="page"
              group={openGroupState}
              onClose={closeGroup}
              onShare={setShareGroup}
              onOpenAnother={openGroup}
              onOpenVenue={openVenue}
              onOpenEvent={openEvent}
            />
          ) : groupsLoading ? (
            <ShareablePageLoading />
          ) : (
            <ShareableMissing backHref={backHref} />
          ))}
      </ShareablePageChrome>
    );
  }

  return (
    <>
      <DiscoveryAppShell
        navbarCollapsed={{ mobile: !mobileNav, desktop: false }}
        navbar={
          <Sidebar
            active={view}
            mobileOpen={mobileNav}
            onCloseMobile={() => setMobileNav(false)}
            sidebarPromo={undefined}
          />
        }
        header={
            <Group justify="space-between" h="100%" px={{ base: "md", sm: "xl" }} wrap="nowrap">
              <Group gap="sm" wrap="nowrap">
                <ActionIcon
                  variant="default"
                  size="lg"
                  radius="xl"
                  onClick={() => setMobileNav(true)}
                  aria-label={t("openMenu")}
                  hiddenFrom="lg"
                >
                  <MenuIcon size={20} stroke={1.75} />
                </ActionIcon>
                <Anchor component={Link} href="/" underline="never" aria-label={t("goHome")}>
                  <Logo
                    logoUrl={site?.logoUrl}
                    logoLightUrl={site?.logoLightUrl}
                    withWordmark={false}
                    size={48}
                  />
                </Anchor>
              </Group>

              <Group gap="xs" wrap="nowrap">
                <Box pos="relative">
                  <ActionIcon
                    component={Link}
                    href={buildPathForView("Saved")}
                    variant="default"
                    size="lg"
                    radius="xl"
                    aria-label={t("saved")}
                  >
                    <Heart size={16} stroke={1.75} />
                  </ActionIcon>
                  {saved.length > 0 ? (
                    <Badge
                      size="xs"
                      circle
                      color="brand"
                      pos="absolute"
                      top={-4}
                      right={-4}
                      style={{ pointerEvents: "none" }}
                    >
                      {saved.length}
                    </Badge>
                  ) : null}
                </Box>
                <ActionIcon
                  variant="default"
                  size="lg"
                  radius="xl"
                  aria-label={t("notifications")}
                >
                  <Bell size={16} stroke={1.75} />
                </ActionIcon>
                {smUp ? (
                  <AppButton
                    component={Link}
                    href={buildPathForView("Calculator")}
                    variant="outline"
                    radius="xl"
                    size="compact-md"
                    rightSection={
                      items.length > 0 ? (
                        <Badge size="xs" circle color="brand">
                          {items.length}
                        </Badge>
                      ) : undefined
                    }
                  >
                    {t("budget")}
                  </AppButton>
                ) : null}
                <ThemeToggle />
                <CurrencySwitcher variant="header" />
                <LocaleSwitcher variant="header" />
                <ActionIcon
                  component={Link}
                  href={buildPathForView("My Account")}
                  variant={view === "My Account" ? "filled" : "default"}
                  color={view === "My Account" ? "brand" : undefined}
                  size="lg"
                  radius="xl"
                  aria-label={t("myAccount")}
                >
                  <UserCircle size={20} stroke={1.75} />
                </ActionIcon>
              </Group>
            </Group>
        }
      >
            <Box
              maw={1400}
              mx="auto"
              w="100%"
              px={{ base: "md", sm: "xl" }}
              py={{ base: "lg", sm: "xl" }}
            >
              {view === "Home" && (
                <HomeView
                  onNavigate={navigateToView}
                  onOpenProvider={openVenue}
                  onOpenGroup={openGroup}
                  onOpenEvent={openEvent}
                />
              )}
              {view === "Program" && !route.programVertical && (
                <ProgramWeekView
                  onOpenProvider={openVenue}
                  onOpenEvent={openEvent}
                  onShareProvider={setShareProvider}
                />
              )}
              {view === "Program" && route.programVertical && (
                <ProgramVerticalView
                  vertical={route.programVertical}
                  onOpenProvider={openVenue}
                  onOpenEvent={openEvent}
                  onShareProvider={setShareProvider}
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
              <Box
                mt="xl"
                pt="md"
                style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
              >
                <PublicSiteFooter
                  meta={
                    <>
                      {t("brand")} · {tf("tagline")} ·{" "}
                      <Anchor component={Link} href="/admin" size="xs" underline="always">
                        {tf("admin")}
                      </Anchor>
                    </>
                  }
                />
              </Box>
            </Box>
      </DiscoveryAppShell>

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
        onOpenVenue={openVenue}
        onOpenEvent={openEvent}
      />
      <MeetupShareDialog
        group={shareGroup}
        onClose={() => setShareGroup(null)}
      />
    </>
  );
}
