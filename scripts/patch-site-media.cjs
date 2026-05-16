#!/usr/bin/env node
/** Update Mongo site doc hero/guide image URLs without wiping listings. */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

const guideUrl =
  process.env.NEXT_PUBLIC_IMG_BB_GUIDE_CARD || "https://i.ibb.co/xK672jw6/6a4e4e8ea50c.jpg";

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "budapest-night";
  if (!uri) throw new Error("Missing MONGODB_URI");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  const site = await db.collection("site").findOne({ _id: "main" });
  const media = {
    homeHeroUrl: process.env.NEXT_PUBLIC_IMG_BB_HOME_HERO || "https://i.ibb.co/GQCgxnm0/cbe8e6335604.jpg",
    discoverHeroUrl: process.env.NEXT_PUBLIC_IMG_BB_DISCOVER_HERO || "https://i.ibb.co/HLd5nwcK/27a9829853a0.jpg",
  };
  const guides = Array.isArray(site?.guides)
    ? site.guides.map((g) => ({ ...g, imageUrl: guideUrl }))
    : undefined;
  await db.collection("site").updateOne(
    { _id: "main" },
    {
      $set: {
        ...media,
        ...(guides ? { guides } : {}),
        homePopularPickProviderNames: ["Szimpla Kert", "New York Café", "A38 Ship"],
        homePopularMeetupGroupId: "grp-budapest-art-walk-terezvaros",
      },
    },
    { upsert: true },
  );
  console.log("Patched site media:", media);
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
