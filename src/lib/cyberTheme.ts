/** Monochrome surfaces with red accent chips and panels. */

export const CYBER_TONE_BG: Record<string, string> = {
  orange: "bg-foreground/8 text-foreground ring-1 ring-border",
  teal: "bg-foreground/8 text-foreground ring-1 ring-border",
  pink: "bg-foreground/8 text-foreground ring-1 ring-border",
  amber: "bg-foreground/8 text-foreground ring-1 ring-border",
  blue: "bg-foreground/8 text-foreground ring-1 ring-border",
};

export const CYBER_TONE_LINK: Record<string, string> = {
  orange: "text-foreground hover:text-foreground",
  teal: "text-foreground hover:text-foreground",
  pink: "text-foreground hover:text-foreground",
  amber: "text-foreground hover:text-foreground",
  blue: "text-foreground hover:text-foreground",
};

export const CYBER_PANEL = "rounded-[2rem] border border-border bg-card";

export const ACCOUNT_PANEL = CYBER_PANEL;

export const CATEGORY_BADGE: Record<string, string> = {
  Venues: "bg-muted text-foreground ring-1 ring-border",
  Events: "bg-muted text-foreground ring-1 ring-border",
  Parties: "bg-muted text-foreground ring-1 ring-border",
  Restaurants: "bg-muted text-foreground ring-1 ring-border",
  Cafés: "bg-muted text-foreground ring-1 ring-border",
  "Meet-Up Group": "bg-muted text-foreground ring-1 ring-border",
  Culture: "bg-muted text-foreground ring-1 ring-border",
  default: "bg-muted/80 text-foreground ring-1 ring-border",
};

export const FILTER_CHIP_ACTIVE = "border-primary bg-primary text-primary-foreground";

export const FILTER_CHIP_IDLE =
  "border-border bg-card text-foreground hover:border-foreground/30 hover:text-foreground";
