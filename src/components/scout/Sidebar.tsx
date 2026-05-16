"use client";

import {
  CalendarDays,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  Palette,
  Heart,
  Calculator,
  Users,
  Bot,
  X,
  Home,
  UserCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildPathForView } from "@/lib/appPaths";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/provider";

export type ViewKey =
  | Category
  | "Saved"
  | "Calculator"
  | "Split Check"
  | "Scout AI Assistant"
  | "Meet-Up Groups"
  | "Home"
  | "My Account";

type NavItem = {
  key: ViewKey;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const EXPLORE_ITEMS: NavItem[] = [
  { key: "Home", labelKey: "home", icon: Home },
  { key: "Events", labelKey: "events", icon: CalendarDays },
  { key: "Parties", labelKey: "parties", icon: PartyPopper },
  { key: "Restaurants", labelKey: "restaurants", icon: UtensilsCrossed },
  { key: "Cafés", labelKey: "cafes", icon: Coffee },
  { key: "Meet-Up Groups", labelKey: "culture", icon: Palette },
  { key: "Scout AI Assistant", labelKey: "nightGuide", icon: Bot, disabled: true },
];

const NIGHT_ITEMS: NavItem[] = [
  { key: "Saved", labelKey: "saved", icon: Heart },
  { key: "Calculator", labelKey: "budget", icon: Calculator },
  { key: "Split Check", labelKey: "split", icon: Users },
  { key: "My Account", labelKey: "myAccount", icon: UserCircle },
];

interface Props {
  active: ViewKey;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  logoUrl?: string | null;
  sidebarPromo?: { title: string; body: string; cta: string };
}

const navLinkClass = (isActive: boolean) =>
  cn(
    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(310_100%_62%_/_0.35)]"
      : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-accent",
  );

export function Sidebar({ active, mobileOpen, onCloseMobile, logoUrl, sidebarPromo }: Props) {
  const t = useTranslations("nav");
  const ts = useTranslations("sidebar");

  const renderItems = (items: NavItem[]) =>
    items.map(({ key, labelKey, icon: Icon, disabled }) => (
      <li key={key}>
        {disabled ? (
          <button
            type="button"
            disabled
            title={t("unavailable")}
            className={cn(
              "flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-45",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(labelKey)}
          </button>
        ) : (
          <Link
            href={buildPathForView(key)}
            onClick={onCloseMobile}
            className={navLinkClass(active === key)}
            aria-current={active === key ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {t(labelKey)}
          </Link>
        )}
      </li>
    ));

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 flex w-72 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <Link
            href="/"
            onClick={onCloseMobile}
            className="rounded-lg transition-opacity hover:opacity-80"
            aria-label={t("goHome")}
          >
            <Logo logoUrl={logoUrl} />
          </Link>
          <button
            className="rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            onClick={onCloseMobile}
            aria-label={t("closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2" aria-label="Main">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">{t("explore")}</p>
          <ul className="space-y-1">{renderItems(EXPLORE_ITEMS)}</ul>

          <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">{t("yourNight")}</p>
          <ul className="space-y-1">{renderItems(NIGHT_ITEMS)}</ul>
        </nav>

        <div className="m-4 rounded-2xl border border-accent/20 bg-sidebar-accent p-5 neon-border">
          <p className="font-display text-sm font-semibold text-sidebar-foreground">
            {sidebarPromo?.title ?? ts("listVenueTitle")}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
            {sidebarPromo?.body ?? ts("listVenueBody")}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          >
            {sidebarPromo?.cta ?? ts("listVenueCta")}
          </Button>
        </div>
      </aside>
    </>
  );
}
