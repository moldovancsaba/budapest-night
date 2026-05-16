"use client";

import { cn } from "@/lib/utils";
import { SiteLucideIcon } from "@/lib/siteLucideIcon";
import { useSiteCatalog } from "@/hooks/useCatalog";
import { DEFAULT_SITE } from "@/types/site";
import type { SiteDoc } from "@/types/site";
import { CYBER_PANEL, CYBER_TONE_BG } from "@/lib/cyberTheme";

export function TrustStrip() {
  const { data: site } = useSiteCatalog();
  const s = site ?? ({ _id: "main", ...DEFAULT_SITE } as SiteDoc);

  return (
    <section className={cn("mt-12 p-8 neon-border", CYBER_PANEL)}>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {s.trustPillars.map((pillar) => (
          <div key={pillar.title} className="flex items-start gap-3">
            <div
              className={cn(
                "grid h-10 w-10 shrink-0 place-items-center rounded-full",
                CYBER_TONE_BG[pillar.tone] ?? CYBER_TONE_BG.teal,
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
