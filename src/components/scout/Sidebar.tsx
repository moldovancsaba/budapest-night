import {
  CalendarDays,
  PartyPopper,
  UtensilsCrossed,
  Coffee,
  Palette,
  Heart,
  Calculator,
  Bot,
  X,
  Home,
  UserCircle,
} from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/provider";

export type ViewKey = Category | "Saved" | "Calculator" | "Scout AI Assistant" | "Meet-Up Groups" | "Home" | "My Account";

type NavItem = {
  key: ViewKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const ITEMS: NavItem[] = [
  { key: "Home", label: "Home", icon: Home },
  { key: "Events", label: "Events", icon: CalendarDays },
  { key: "Parties", label: "Parties", icon: PartyPopper },
  { key: "Restaurants", label: "Restaurants", icon: UtensilsCrossed },
  { key: "Cafés", label: "Cafés", icon: Coffee },
  { key: "Meet-Up Groups", label: "Culture", icon: Palette },
  { key: "Scout AI Assistant", label: "Night Guide", icon: Bot, disabled: true },
  { key: "Saved", label: "Saved", icon: Heart },
  { key: "Calculator", label: "Budget", icon: Calculator },
  { key: "My Account", label: "My Account", icon: UserCircle },
];

interface Props {
  active: ViewKey;
  onChange: (v: ViewKey) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  logoUrl?: string | null;
  sidebarPromo?: { title: string; body: string; cta: string };
}

export function Sidebar({ active, onChange, mobileOpen, onCloseMobile, logoUrl, sidebarPromo }: Props) {
  const handle = (k: ViewKey) => {
    onChange(k);
    onCloseMobile();
  };
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onCloseMobile} aria-hidden />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6">
          <button
            onClick={() => handle("Home")}
            className="rounded-lg transition-opacity hover:opacity-80"
            aria-label="Go to home"
          >
            <Logo logoUrl={logoUrl} />
          </button>
          <button
            className="rounded-md p-2 text-sidebar-foreground/70 hover:bg-sidebar-accent lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-2" aria-label="Main">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">Explore</p>
          <ul className="space-y-1">
            {ITEMS.slice(0, 7).map(({ key, label, icon: Icon, disabled }) => (
              <li key={key}>
                <button
                  type="button"
                  disabled={disabled}
                  title={disabled ? "Unavailable" : undefined}
                  onClick={() => handle(key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    disabled &&
                      "cursor-not-allowed opacity-45 hover:bg-transparent disabled:opacity-45 disabled:hover:bg-transparent",
                    !disabled && active === key
                      ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(310_100%_62%_/_0.35)]"
                      : !disabled && "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-accent",
                  )}
                  aria-current={!disabled && active === key ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <p className="px-3 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">Your night</p>
          <ul className="space-y-1">
            {ITEMS.slice(7).map(({ key, label, icon: Icon, disabled }) => (
              <li key={key}>
                <button
                  type="button"
                  disabled={disabled}
                  title={disabled ? "Unavailable" : undefined}
                  onClick={() => handle(key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    disabled &&
                      "cursor-not-allowed opacity-45 hover:bg-transparent disabled:opacity-45 disabled:hover:bg-transparent",
                    !disabled && active === key
                      ? "bg-primary text-primary-foreground shadow-[0_0_16px_hsl(310_100%_62%_/_0.35)]"
                      : !disabled && "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-accent",
                  )}
                  aria-current={!disabled && active === key ? "page" : undefined}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="m-4 rounded-2xl border border-accent/20 bg-sidebar-accent p-5 neon-border">
          <p className="font-display text-sm font-semibold text-sidebar-foreground">
            {sidebarPromo?.title ?? "List your venue"}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-sidebar-foreground/70">
            {sidebarPromo?.body ?? "Reach night owls and culture seekers across Budapest."}
          </p>
          <Button
            size="sm"
            variant="secondary"
            className="mt-3 w-full border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20"
          >
            {sidebarPromo?.cta ?? "Get in touch"}
          </Button>
        </div>
      </aside>
    </>
  );
}
