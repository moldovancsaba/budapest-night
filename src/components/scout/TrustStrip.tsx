"use client";

import { cn } from "@/lib/utils";
import { SiteLucideIcon } from "@/lib/siteLucideIcon";
import { useSiteCatalog } from "@/hooks/useCatalog";
import { DEFAULT_SITE } from "@/types/site";
import type { SiteDoc } from "@/types/site";

const TONE_BG: Record<string, string> = {
  orange: "bg-orange/15 text-orange",
  teal: "bg-teal-soft text-teal",
  pink: "bg-[hsl(340_70%_94%)] text-[hsl(340_60%_45%)]",
  amber: "bg-[hsl(40_90%_92%)] text-[hsl(35_85%_45%)]",
  blue: "bg-[hsl(210_80%_94%)] text-[hsl(210_70%_45%)]",
};

export function TrustStrip() {
  const { data: site } = useSiteCatalog();
  const s = site ?? ({ _id: "main", ...DEFAULT_SITE } as SiteDoc);

  return (
    <section className="mt-12 rounded-3xl border border-accent/15 bg-secondary/80 p-8 neon-border">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {s.trustPillars.map((pillar) => (
          <div key={pillar.title} className="flex items-start gap-3">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full shadow-sm ring-1 ring-border/60",
                TONE_BG[pillar.tone] ?? TONE_BG.teal,
              )}
            >
              <SiteLucideIcon name={pillar.icon} className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold text-foreground">{pillar.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{pillar.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
