"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import type { AppLocale } from "@/i18n/config";
import type { ViewKey } from "@/components/scout/Sidebar";
import type { BoroughChoice, Category, Provider } from "@/types/provider";
import type { MeetupGroup } from "@/types/meetup";
import {
  type AppRoute,
  type AppSection,
  type LocationFilter,
  buildGroupPath,
  buildPathForView,
  buildSectionPath,
  buildVenuePath,
  parseAppRoute,
  sectionFromCategory,
  viewToSection,
} from "@/lib/appPaths";

export function useAppNavigation() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const route: AppRoute = useMemo(
    () => parseAppRoute(pathname, searchParams),
    [pathname, searchParams],
  );

  useEffect(() => {
    if (route.invalid) router.replace("/");
  }, [route.invalid, router]);

  const navigateToView = useCallback(
    (
      view: Category | "Saved" | "Calculator" | "Split Check" | "Meet-Up Groups" | "My Account" | "Home",
      location?: { borough?: BoroughChoice; neighborhood?: string },
    ) => {
      const loc: LocationFilter | undefined =
        location?.borough && location.borough !== "All"
          ? { borough: location.borough, neighborhood: location.neighborhood }
          : undefined;
      router.push(buildPathForView(view as ViewKey, loc));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  const navigateToSection = useCallback(
    (section: AppSection, location?: LocationFilter) => {
      router.push(buildSectionPath(section, { location }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router],
  );

  const openVenue = useCallback(
    (provider: Provider) => {
      router.push(
        buildVenuePath(provider, {
          from: sectionFromCategory(provider.category),
          location: route.location ?? undefined,
          locale,
        }),
      );
    },
    [router, route.location, locale],
  );

  const closeVenue = useCallback(() => {
    router.push(buildSectionPath(route.fromSection, { location: route.location ?? undefined }));
  }, [router, route.fromSection, route.location]);

  const openGroup = useCallback(
    (group: MeetupGroup) => {
      router.push(buildGroupPath(group.id));
    },
    [router],
  );

  const closeGroup = useCallback(() => {
    router.push(buildSectionPath("culture", { location: route.location ?? undefined }));
  }, [router, route.location]);

  const clearLocationFilter = useCallback(() => {
    router.push(buildSectionPath(route.section));
  }, [router, route.section]);

  return {
    route,
    view: route.view,
    location: route.location,
    venueId: route.venueId,
    groupId: route.groupId,
    navigateToView,
    navigateToSection,
    openVenue,
    closeVenue,
    openGroup,
    closeGroup,
    clearLocationFilter,
    currentSection: viewToSection(route.view),
  };
}
