import { NEIGHBORHOODS } from "@/data/locations";
import type { Borough } from "@/types/provider";

/** Canonical neighborhood name (Mongo / filters) → `neighborhood.*` message key. */
export const NEIGHBORHOOD_KEY: Record<string, string> = {
  "Váci utca": "vaciUtca",
  "Deák tér": "deakTer",
  Parliament: "parliament",
  "Danube Promenade": "danubePromenade",
  "Inner City": "innerCity",
  "Andrássy út": "andrassyUt",
  Opera: "opera",
  Oktogon: "oktogon",
  "Király utca": "kiralyUtca",
  "Liszt Ferenc tér": "lisztFerencTer",
  "Jewish Quarter": "jewishQuarter",
  "Gozsdu Udvar": "gozsduUdvar",
  "Kazinczy utca": "kazinczyUtca",
  "Wesselényi utca": "wesselenyiUtca",
  "Rákóczi tér": "rakocziTer",
  "Corvin-negyed": "corvinNegyed",
  Műegyetem: "muegyetem",
  "Petőfi Bridge": "petofiBridge",
  "Nagytemplom utca": "nagytemplomUtca",
  "Boráros tér": "borarosTer",
  "Millenniumi Városközpont": "millenniumiVaroskozpont",
  "Fábián Juli": "fabianJuli",
  "Castle District": "castleDistrict",
  "Gellért Hill": "gellertHill",
  Tabán: "taban",
  Rózsadomb: "rozsadomb",
  "Szent Gellért tér": "szentGellertTer",
  "Óbuda Island": "obudaIsland",
  Aquincum: "aquincum",
  "Kolosy tér": "kolosyTer",
  "Bécsi út": "becsiUt",
  "Main Square Óbuda": "mainSquareObuda",
  "Móricz Zsigmond körtér": "moriczZsigmondKorut",
  "Gellért Baths area": "gellertBathsArea",
  Infopark: "infopark",
  "Kosztolányi Dezső tér": "kosztolanyiDezsoTer",
  "Bikás park": "bikasPark",
  Kelenföld: "kelenfold",
};

export const ALL_NEIGHBORHOOD_CANONICAL = Object.values(NEIGHBORHOODS).flat();

export function neighborhoodMessageKey(canonical: string): string | undefined {
  return NEIGHBORHOOD_KEY[canonical];
}

export function neighborhoodsForBorough(borough: Borough): string[] {
  return NEIGHBORHOODS[borough] ?? [];
}
