"use client";

import { useState } from "react";
import { Sidebar, type ViewKey } from "@/components/scout/Sidebar";
import { DiscoverView } from "@/components/scout/views/DiscoverView";
import { SavedView } from "@/components/scout/views/SavedView";
import { CalculatorView } from "@/components/scout/views/CalculatorView";
import { ScoutAssistantView } from "@/components/scout/views/ScoutAssistantView";
import { MeetupGroupsView } from "@/components/scout/views/MeetupGroupsView";
import { HomeView } from "@/components/scout/views/HomeView";
import { MyAccountView } from "@/components/scout/views/MyAccountView";
import { ProviderProfile } from "@/components/scout/panels/ProviderProfile";
import { ShareDialog } from "@/components/scout/panels/ShareDialog";
import { MeetupGroupProfile } from "@/components/scout/panels/MeetupGroupProfile";
import { MeetupShareDialog } from "@/components/scout/panels/MeetupShareDialog";
import { TrustStrip } from "@/components/scout/TrustStrip";
import { Logo } from "@/components/scout/Logo";
import type { Provider, BoroughChoice, Category } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import { Menu, Heart, Bell, UserCircle } from "lucide-react";
import { useSaved, useCalculator } from "@/store/useScout";
import { useSiteCatalog } from "@/hooks/useCatalog";

const DISCOVER_VIEWS: Category[] = ["Events", "Parties", "Restaurants", "Cafés"];

export default function BudapestNightShell() {
  const [view, setView] = useState<ViewKey>("Home");
  const [openProvider, setOpenProvider] = useState<Provider | null>(null);
  const [shareProvider, setShareProvider] = useState<Provider | null>(null);
  const [openGroup, setOpenGroup] = useState<MeetupGroup | null>(null);
  const [shareGroup, setShareGroup] = useState<MeetupGroup | null>(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ borough?: BoroughChoice; neighborhood?: string } | null>(null);
  const { saved } = useSaved();
  const { items } = useCalculator();
  const { data: site } = useSiteCatalog();

  const handleNavigate = (
    next: Category | "Saved" | "Calculator" | "Meet-Up Groups" | "My Account",
    location?: { borough?: BoroughChoice; neighborhood?: string },
  ) => {
    if (location) {
      setPendingLocation({
        borough: location.borough,
        neighborhood: location.borough === "All" ? undefined : location.neighborhood,
      });
    } else setPendingLocation(null);
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const discoverKey = pendingLocation
    ? `${pendingLocation.borough ?? ""}-${pendingLocation.neighborhood ?? ""}`
    : "default";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        active={view}
        onChange={setView}
        mobileOpen={mobileNav}
        onCloseMobile={() => setMobileNav(false)}
        logoUrl={site?.logoUrl}
        sidebarPromo={
          site
            ? { title: site.sidebarTitle, body: site.sidebarBody, cta: site.sidebarCtaLabel }
            : undefined
        }
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/80 bg-background/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card lg:hidden"
              onClick={() => setMobileNav(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setView("Home")}
              className="flex items-center gap-3 rounded-full transition-opacity hover:opacity-80"
              aria-label="Go to home"
            >
              <Logo logoUrl={site?.logoUrl} withWordmark={false} size={48} />
              <span className="font-display text-base font-bold tracking-widest neon-text sm:text-lg">
                Budapest Night
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("Saved")}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:border-accent"
              aria-label="Saved"
            >
              <Heart className="h-4 w-4" />
              {saved.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {saved.length}
                </span>
              )}
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground hover:border-accent"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView("Calculator")}
              className="relative hidden items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 sm:flex"
            >
              Budget
              {items.length > 0 && (
                <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {items.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setView("My Account")}
              className={`grid h-10 w-10 place-items-center rounded-full border text-foreground hover:border-accent ${
                view === "My Account" ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card"
              }`}
              aria-label="My Account"
            >
              <UserCircle className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-[1400px] animate-fade-in">
            {view === "Home" && (
              <HomeView onNavigate={handleNavigate} onOpenProvider={setOpenProvider} onOpenGroup={setOpenGroup} />
            )}
            {DISCOVER_VIEWS.includes(view as Category) && (
              <DiscoverView
                key={`${view}-${discoverKey}`}
                category={view as Category}
                onOpen={setOpenProvider}
                onShare={setShareProvider}
                initialBorough={pendingLocation?.borough ?? null}
                initialNeighborhood={pendingLocation?.neighborhood ?? null}
              />
            )}
            {view === "Saved" && <SavedView onOpen={setOpenProvider} onShare={setShareProvider} />}
            {view === "Calculator" && <CalculatorView />}
            {view === "Scout AI Assistant" && <ScoutAssistantView />}
            {view === "Meet-Up Groups" && (
              <MeetupGroupsView onOpen={setOpenGroup} onShare={setShareGroup} />
            )}
            {view === "My Account" && (
              <MyAccountView
                onNavigate={handleNavigate}
                onOpenProvider={setOpenProvider}
                onShareProvider={setShareProvider}
              />
            )}
            {view !== "Home" && <TrustStrip />}
            <footer className="mt-10 border-t border-border/60 pt-6 text-center text-xs text-muted-foreground">
              Budapest Night · Neon-lit local guide · Prices for planning only ·{" "}
              <a href="/admin" className="text-accent underline hover:text-accent/90">
                Staff admin
              </a>
            </footer>
          </div>
        </main>
      </div>

      <ProviderProfile
        provider={openProvider}
        onClose={() => setOpenProvider(null)}
        onShare={setShareProvider}
        onOpenAnother={(p) => setOpenProvider(p)}
      />
      <ShareDialog provider={shareProvider} onClose={() => setShareProvider(null)} />
      <MeetupGroupProfile
        group={openGroup}
        onClose={() => setOpenGroup(null)}
        onShare={setShareGroup}
        onOpenAnother={(g) => setOpenGroup(g)}
      />
      <MeetupShareDialog group={shareGroup} onClose={() => setShareGroup(null)} />
    </div>
  );
}
