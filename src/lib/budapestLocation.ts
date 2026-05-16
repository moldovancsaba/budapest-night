import type { Borough } from "@/types/provider";
import type { NightEvent } from "@/types/event";
import type { Provider } from "@/types/provider";

/** Old ingest ids → current provider id (venue URL / venueIds resolution). */
export const LEGACY_PROVIDER_ID_ALIASES: Record<string, string> = {
  "prov-budapest-park-obuda": "prov-budapest-park-ferencvaros",
  "prov-mvm-dome-ujbuda": "prov-mvm-dome-terezvaros",
  "prov-cov-island-cafe-obuda": "prov-cov-island-cafe-ferencvaros",
  "prov-cov-park-party-obuda": "prov-cov-park-party-ferencvaros",
  "prov-cov-rudas-ujbuda-party": "prov-cov-rudas-buda-party",
};

export function resolveLegacyProviderId(idOrPathKey: string): string | undefined {
  return LEGACY_PROVIDER_ID_ALIASES[idOrPathKey];
}

/** Verified overrides for major venues (official address beats heuristics). */
export const CANONICAL_VENUE_LOCATIONS: Record<
  string,
  { borough: Borough; neighborhood: string; address: string }
> = {
  "prov-mvm-dome-terezvaros": {
    borough: "Terézváros",
    neighborhood: "Stefánia út",
    address: "1143 Budapest, Stefánia út 2, Hungary",
  },
  "prov-budapest-park-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-cov-island-cafe-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-cov-park-party-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Fábián Juli",
    address: "1095 Budapest, Fábián Juli tér 1, Hungary",
  },
  "prov-mupa-ferencvaros": {
    borough: "Ferencváros",
    neighborhood: "Műegyetem",
    address: "1095 Budapest, Komor Marcell utca 1, Hungary",
  },
  "prov-mng-castle-buda": {
    borough: "Buda",
    neighborhood: "Castle District",
    address: "1014 Budapest, Szent György tér 2, Hungary",
  },
  "prov-rudas-buda": {
    borough: "Buda",
    neighborhood: "Tabán",
    address: "1013 Budapest, Döbrentei tér 9, Hungary",
  },
};

const STREET_HINTS: { pattern: RegExp; borough: Borough; neighborhood: string }[] = [
  { pattern: /fábián juli/i, borough: "Ferencváros", neighborhood: "Fábián Juli" },
  { pattern: /stefánia|stefania/i, borough: "Terézváros", neighborhood: "Stefánia út" },
  { pattern: /andrássy|andrassy/i, borough: "Terézváros", neighborhood: "Andrássy út" },
  { pattern: /kazinczy/i, borough: "Erzsébetváros", neighborhood: "Kazinczy utca" },
  { pattern: /gozsdu/i, borough: "Erzsébetváros", neighborhood: "Gozsdu Udvar" },
  { pattern: /petőfi rakpart|petofi rakpart/i, borough: "Ferencváros", neighborhood: "Petőfi Bridge" },
  { pattern: /komor marcell|müpa|mupa/i, borough: "Ferencváros", neighborhood: "Műegyetem" },
  { pattern: /szent györgy|castle|budai vár/i, borough: "Buda", neighborhood: "Castle District" },
  { pattern: /döbrentei|varfok|citadella|gellért|gellert/i, borough: "Buda", neighborhood: "Gellért Hill" },
];

/** Resolve listing location from canonical registry or high-confidence street hints. */
export function resolveProviderLocation(
  provider: Pick<Provider, "id" | "borough" | "neighborhood" | "address">,
): Pick<Provider, "borough" | "neighborhood" | "address"> {
  const canonical =
    CANONICAL_VENUE_LOCATIONS[provider.id] ??
    (resolveLegacyProviderId(provider.id)
      ? CANONICAL_VENUE_LOCATIONS[resolveLegacyProviderId(provider.id)!]
      : undefined);
  if (canonical) return canonical;

  const address = provider.address?.trim() ?? "";
  for (const h of STREET_HINTS) {
    if (h.pattern.test(address)) {
      return { borough: h.borough, neighborhood: h.neighborhood, address };
    }
  }

  return {
    borough: provider.borough,
    neighborhood: provider.neighborhood,
    address,
  };
}

/** Keep timed events aligned with their primary host venue for filters and cards. */
export function syncEventLocationFromHost(
  event: Pick<NightEvent, "borough" | "neighborhood" | "venueIds">,
  host: Pick<Provider, "borough" | "neighborhood"> | null | undefined,
): Pick<NightEvent, "borough" | "neighborhood"> {
  if (!host) return { borough: event.borough, neighborhood: event.neighborhood };
  return { borough: host.borough, neighborhood: host.neighborhood };
}
