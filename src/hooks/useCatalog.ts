"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intl";
import type { AppLocale } from "@/i18n/config";
import type { Provider } from "@/types/provider";
import type { PublicNightEvent } from "@/lib/publicEvent";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import type { Borough } from "@/types/provider";
import type { SiteDoc } from "@/types/site";

export function useProvidersCatalog() {
  const locale = useLocale() as AppLocale;
  return useQuery({
    queryKey: ["catalog", "providers", locale],
    queryFn: async () => {
      const r = await fetch(`/api/public/providers?locale=${encodeURIComponent(locale)}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load providers");
      }
      return r.json() as Promise<Provider[]>;
    },
    staleTime: 60_000,
  });
}

export function useEventsCatalog() {
  const locale = useLocale() as AppLocale;
  return useQuery({
    queryKey: ["catalog", "events", locale],
    queryFn: async () => {
      const r = await fetch(`/api/public/events?locale=${encodeURIComponent(locale)}`);
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load events");
      }
      return r.json() as Promise<PublicNightEvent[]>;
    },
    staleTime: 60_000,
  });
}

export function useMeetupGroupsCatalog() {
  return useQuery({
    queryKey: ["catalog", "meetups"],
    queryFn: async () => {
      const r = await fetch("/api/public/meetup-groups");
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error((j as { error?: string }).error || "Failed to load meetups");
      }
      return r.json() as Promise<PublicMeetupGroup[]>;
    },
    staleTime: 60_000,
  });
}

export function useNeighborhoodsCatalog() {
  return useQuery({
    queryKey: ["catalog", "locations"],
    queryFn: async () => {
      const r = await fetch("/api/public/locations");
      if (!r.ok) throw new Error("Failed to load locations");
      return r.json() as Promise<Record<Borough, string[]>>;
    },
    staleTime: 300_000,
  });
}

export function useSiteCatalog() {
  return useQuery({
    queryKey: ["catalog", "site"],
    queryFn: async () => {
      const r = await fetch("/api/public/site");
      if (!r.ok) throw new Error("Failed to load site");
      return (await r.json()) as SiteDoc;
    },
    staleTime: 60_000,
  });
}