"use client";

import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import { buildProgramPath } from "@/lib/appPaths";
import { buildAbsoluteUrl } from "@/lib/appShareUrls";
import { collectionPageJsonLd, JsonLd } from "@/components/seo/JsonLd";
import type { PublicProgramWeek } from "@/types/programWeek";
import type { PublicNightEvent } from "@/lib/publicEvent";

export function ProgramWeekJsonLd({
  week,
  events,
}: {
  week: PublicProgramWeek;
  events: PublicNightEvent[];
}) {
  const locale = useLocale() as AppLocale;
  const url = buildAbsoluteUrl(buildProgramPath(undefined, { locale }), locale);
  const items = events.slice(0, 12).map((e) => ({ name: e.title }));

  return (
    <JsonLd
      data={collectionPageJsonLd({
        name: week.headline,
        description: week.intro,
        url,
        items,
      })}
    />
  );
}
