/** Shared neon tone classes for cards, chips, and marketing blocks. */
export const CYBER_TONE_BG: Record<string, string> = {
  orange: "bg-primary/20 text-primary ring-1 ring-primary/30",
  teal: "bg-accent/15 text-accent ring-1 ring-accent/30",
  pink: "bg-[hsl(320_90%_55%_/_0.15)] text-[hsl(320_90%_70%)] ring-1 ring-[hsl(320_90%_55%_/_0.35)]",
  amber: "bg-[hsl(45_100%_55%_/_0.12)] text-[hsl(45_100%_65%)] ring-1 ring-[hsl(45_100%_55%_/_0.3)]",
  blue: "bg-[hsl(210_100%_60%_/_0.15)] text-[hsl(210_100%_75%)] ring-1 ring-[hsl(210_100%_60%_/_0.35)]",
};

export const CYBER_TONE_LINK: Record<string, string> = {
  orange: "text-primary",
  teal: "text-accent",
  pink: "text-[hsl(320_90%_70%)]",
  amber: "text-[hsl(45_100%_65%)]",
  blue: "text-[hsl(210_100%_75%)]",
};

export const CYBER_PANEL =
  "rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-[hsl(280_45%_9%)] to-[hsl(260_50%_6%)]";
