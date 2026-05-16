import type { Borough } from "@/types/provider";

/** Budapest districts and well-known areas for filters, ingest, and Mongo `locations`. */
export const BOROUGHS: Borough[] = [
  "Belváros",
  "Terézváros",
  "Erzsébetváros",
  "Ferencváros",
  "Buda",
  "Óbuda",
  "Újbuda",
];

export const NEIGHBORHOODS: Record<Borough, string[]> = {
  Belváros: ["Váci utca", "Deák tér", "Parliament", "Danube Promenade", "Inner City"],
  Terézváros: ["Andrássy út", "Opera", "Oktogon", "Király utca", "Liszt Ferenc tér", "Stefánia út"],
  Erzsébetváros: ["Jewish Quarter", "Gozsdu Udvar", "Kazinczy utca", "Wesselényi utca", "Rákóczi tér"],
  Ferencváros: [
    "Corvin-negyed",
    "Műegyetem",
    "Petőfi Bridge",
    "Nagytemplom utca",
    "Boráros tér",
    "Millenniumi Városközpont",
    "Fábián Juli",
  ],
  Buda: ["Castle District", "Gellért Hill", "Tabán", "Rózsadomb", "Szent Gellért tér"],
  Óbuda: ["Óbuda Island", "Aquincum", "Kolosy tér", "Bécsi út", "Main Square Óbuda"],
  Újbuda: [
    "Móricz Zsigmond körtér",
    "Gellért Baths area",
    "Infopark",
    "Kosztolányi Dezső tér",
    "Bikás park",
    "Kelenföld",
  ],
};
