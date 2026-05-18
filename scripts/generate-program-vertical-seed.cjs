#!/usr/bin/env node
/**
 * Generates scripts/ingest-payloads/program-verticals-seed.json
 * Run: node scripts/generate-program-vertical-seed.cjs
 * Apply: npm run ingest:db -- scripts/ingest-payloads/program-verticals-seed.json
 */
const fs = require("fs");
const path = require("path");
const { localeBlocks } = require("./lib/locale-blocks.cjs");

const VENUES = [
  {
    id: "prov-urania-film",
    name: "Uránia National Film Theatre",
    borough: "Belváros",
    neighborhood: "Inner City",
    address: "1088 Budapest, Rákóczi út 21, Hungary",
    activityTypes: ["Cinema", "Theatre"],
    website: "https://www.urania.hu/en",
    phone: "+36 1 486 3400",
    email: "info@urania.hu",
    externalProgramUrl: "https://www.urania.hu/en/program",
    shortDescription:
      "Art-deco cinema palace on Rákóczi út — festivals, classics, and premieres in the heart of Pest.",
    longDescription:
      "Uránia National Film Theatre (Uránia Nemzeti Filmszínház) is a landmark 1890s cinema hall on Rákóczi út, hosting festivals, restored classics, and new releases. Check urania.hu for the weekly program and box office hours.\n\nSources: https://www.urania.hu/en https://www.urania.hu/en/program",
    slugBase: "urania-film",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-art-plus-cinema",
    name: "art+ Cinema Budapest",
    borough: "Terézváros",
    neighborhood: "Opera",
    address: "1065 Budapest, Király u. 12, Hungary",
    activityTypes: ["Cinema"],
    website: "https://www.artpluscinema.hu",
    phone: "+36 1 336 4020",
    email: "info@artpluscinema.hu",
    externalProgramUrl: "https://www.artpluscinema.hu/en/program",
    shortDescription: "Independent art-house screens on Király utca — world cinema and festival picks near Oktogon.",
    longDescription:
      "art+ Cinema runs multiple screens on Király utca with arthouse, festival, and retrospective programming. Tickets and schedules are published on artpluscinema.hu.\n\nSources: https://www.artpluscinema.hu https://www.artpluscinema.hu/en/program",
    slugBase: "art-plus-cinema",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-cirko-gegeveny",
    name: "Cirko-Gege",
    borough: "Belváros",
    neighborhood: "Inner City",
    address: "1053 Budapest, Párizsi u. 6, Hungary",
    activityTypes: ["Cinema"],
    website: "https://www.cirkogeco.com",
    phone: "+36 1 266 4242",
    email: "info@cirkogeco.com",
    externalProgramUrl: "https://www.cirkogeco.com/en/movies",
    shortDescription: "Belváros art cinema on Párizsi utca — indie releases and late-night screenings.",
    longDescription:
      "Cirko-Gege is a long-running Budapest arthouse cinema near Ferenciek tere with international and Hungarian titles. Program and tickets: cirkogeco.com.\n\nSources: https://www.cirkogeco.com https://www.cirkogeco.com/en/movies",
    slugBase: "cirko-gegeveny",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-puskin-mozi",
    name: "Puskin Cinema",
    borough: "Belváros",
    neighborhood: "Inner City",
    address: "1053 Budapest, Kossuth Lajos u. 18, Hungary",
    activityTypes: ["Cinema"],
    website: "https://puskinmozi.hu",
    phone: "+36 1 429 6736",
    email: "info@puskinmozi.hu",
    externalProgramUrl: "https://puskinmozi.hu/musor",
    shortDescription: "Central Pest repertory cinema on Kossuth Lajos utca — art and festival screenings.",
    longDescription:
      "Puskin Cinema (Puskin Mozi) programmes arthouse and festival cinema in a central Pest location. See puskinmozi.hu for showtimes.\n\nSources: https://puskinmozi.hu https://puskinmozi.hu/musor",
    slugBase: "puskin-mozi",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-nemzeti-szinhaz",
    name: "Hungarian National Theatre",
    borough: "Ferencváros",
    neighborhood: "Millennium Quarter",
    address: "1095 Budapest, Bajor Gizi park 1, Hungary",
    activityTypes: ["Theatre"],
    website: "https://nemzetiszinhaz.hu",
    phone: "+36 1 476 7100",
    email: "info@nemzetiszinhaz.hu",
    repertoireUrl: "https://nemzetiszinhaz.hu/en/program",
    shortDescription: "National Theatre on the Danube bank — drama, dance, and new Hungarian productions.",
    longDescription:
      "The Hungarian National Theatre (Nemzeti Színház) is the flagship drama company in the Millennium Quarter with a year-round repertoire on the Bajor Gizi park campus. Tickets: nemzetiszinhaz.hu.\n\nSources: https://nemzetiszinhaz.hu https://nemzetiszinhaz.hu/en/program",
    slugBase: "nemzeti-szinhaz",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-katona-szinhaz",
    name: "Katona József Theatre",
    borough: "Belváros",
    neighborhood: "Inner City",
    address: "1052 Budapest, Petőfi Sándor u. 6, Hungary",
    activityTypes: ["Theatre"],
    website: "https://katonajozsef.hu",
    phone: "+36 1 429 0010",
    email: "info@katonajozsef.hu",
    repertoireUrl: "https://katonajozsef.hu/en/program",
    shortDescription: "Award-winning drama company near Vörösmarty tér — contemporary Hungarian and world premieres.",
    longDescription:
      "Katona József Theatre is one of Budapest's leading drama companies with productions at Petőfi Sándor utca and Kamra. Repertoire and tickets on katonajozsef.hu.\n\nSources: https://katonajozsef.hu https://katonajozsef.hu/en/program",
    slugBase: "katona-szinhaz",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-vigszinhaz",
    name: "Vígszínház",
    borough: "Terézváros",
    neighborhood: "Opera",
    address: "1061 Budapest, Paulay Ede u. 35, Hungary",
    activityTypes: ["Theatre"],
    website: "https://vigszinhaz.hu",
    phone: "+36 1 476 9600",
    email: "info@vigszinhaz.hu",
    repertoireUrl: "https://vigszinhaz.hu/en/program",
    shortDescription: "Historic comedy and musical theatre on Paulay Ede utca — classics and new Hungarian shows.",
    longDescription:
      "Vígszínház is a major musical and comedy theatre on Paulay Ede utca near Oktogon. Program and box office: vigszinhaz.hu.\n\nSources: https://vigszinhaz.hu https://vigszinhaz.hu/en/program",
    slugBase: "vigszinhaz",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-radnoti-szinhaz",
    name: "Radnóti Miklós Theatre",
    borough: "Terézváros",
    neighborhood: "Opera",
    address: "1067 Budapest, Nagymező u. 40-44, Hungary",
    activityTypes: ["Theatre"],
    website: "https://radnoti.hu",
    phone: "+36 1 321 5120",
    email: "info@radnoti.hu",
    repertoireUrl: "https://radnoti.hu/en/program",
    shortDescription: "Chamber stages on Nagymező — contemporary drama and Radnóti company premieres.",
    longDescription:
      "Radnóti Miklós Theatre operates multiple stages on Nagymező utca with contemporary Hungarian and international drama. See radnoti.hu for the season program.\n\nSources: https://radnoti.hu https://radnoti.hu/en/program",
    slugBase: "radnoti-szinhaz",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
  {
    id: "prov-mupa-budapest",
    name: "MÜPA Budapest",
    borough: "Ferencváros",
    neighborhood: "Millennium Quarter",
    address: "1095 Budapest, Komor Marcell u. 1, Hungary",
    activityTypes: ["Live Music", "Theatre", "Gallery"],
    website: "https://www.mupa.hu/en",
    phone: "+36 1 555 3000",
    email: "info@mupa.hu",
    externalProgramUrl: "https://www.mupa.hu/en/events",
    shortDescription: "Palace of Arts on the Danube — classical, jazz, dance, and Ludwig Museum exhibitions.",
    longDescription:
      "MÜPA Budapest (Palace of Arts) hosts concerts, opera, dance, and exhibitions in the Bartók National Concert Hall and Ludwig Museum. Full program: mupa.hu.\n\nSources: https://www.mupa.hu/en https://www.mupa.hu/en/events",
    slugBase: "mupa-budapest",
    image: "https://i.ibb.co/nNmMm6Cf/0e45661c9f87.png",
  },
];

const operations = VENUES.map((v) => {
  const { slugBase, shortDescription, longDescription, ...rest } = v;
  return {
    resource: "provider",
    action: "upsert",
    document: {
      ...rest,
      category: "Venues",
      ageRanges: ["All ages", "Family"],
      dayTimeTags: ["Evening", "Weekend", "Weekday"],
      pricePerClass: 0,
      rating: 0,
      reviewCount: 0,
      badges: ["Staff Pick"],
      locales: localeBlocks(slugBase, v.name, shortDescription, longDescription),
    },
  };
});

const payload = {
  sourceUrls: VENUES.map((v) => v.website),
  notes:
    "Program vertical seed — flagship mozi + színház venues for Pesti Est R3. Re-run safe (upsert by id).",
  operations,
};

const out = path.join(__dirname, "ingest-payloads/program-verticals-seed.json");
fs.writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`);
console.log(`Wrote ${operations.length} providers → ${out}`);
