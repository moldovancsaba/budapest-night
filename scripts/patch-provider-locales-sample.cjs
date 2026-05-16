#!/usr/bin/env node
/** Merge sample `locales` blocks onto existing providers (does not replace listings). */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

const SAMPLES = {
  "prov-a38-ferencvaros": {
    hu: {
      name: "A38 Hajó",
      shortDescription:
        "Ukrajnai kőhordó hajóból koncerthelyszín a Dunán — Európa egyik legmenőbb szórakozóhelye.",
      longDescription:
        "Az A38 koncertterem és klub a Petőfi híd budai hídfőjénél horgonyzó hajón. Nézd meg az a38.hu naptárát élő zenés estekhez, DJ programokhoz és teraszból. Érkezz korán dunai italokra az ajtók nyitása előtt.",
      slug: "a38-hajo",
      activityTypes: ["Élő zene", "Elektronikus", "Hajóbulik", "Sör"],
    },
  },
};

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "budapest-night";
  if (!uri) throw new Error("Missing MONGODB_URI");
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db(dbName).collection("providers");

  for (const [id, locales] of Object.entries(SAMPLES)) {
    const cur = await col.findOne({ id });
    if (!cur) {
      console.warn("skip (not found):", id);
      continue;
    }
    const merged = { ...(cur.locales ?? {}), ...locales };
    await col.updateOne({ id }, { $set: { locales: merged } });
    console.log("patched locales:", id, Object.keys(locales).join(", "));
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
