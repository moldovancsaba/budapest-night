"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import type { PublicProgramWeek } from "@/types/programWeek";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";

export type ProgramWeekPayload = {
  week: PublicProgramWeek;
  featuredEvents: PublicNightEvent[];
  /** Editorial picks outside the Thu–Wed window (e.g. headline concerts). */
  spotlightEvents?: PublicNightEvent[];
  featuredProviders: Provider[];
  fallbackEventCount: number;
  verticalSponsors?: Record<string, { name: string; url?: string }>;
};

export function useProgramWeek(week = "current") {
  const locale = useLocale() as AppLocale;
  return useQuery({
    queryKey: ["program-week", locale, week],
    queryFn: async (): Promise<ProgramWeekPayload> => {
      const r = await fetch(
        `/api/public/program-week?locale=${encodeURIComponent(locale)}&week=${encodeURIComponent(week)}`,
      );
      if (!r.ok) throw new Error("program-week fetch failed");
      return r.json();
    },
    staleTime: 60_000,
  });
}
