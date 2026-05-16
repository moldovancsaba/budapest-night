#!/usr/bin/env node
/** Update Mongo site doc hero/guide image URLs without wiping listings. */
require("./load-env.cjs");
const { MongoClient } = require("mongodb");

const GUIDE_IMAGE_BY_ID = {
  "guide-belvaros": "https://i.ibb.co/Wv8BgB2k/e0c2e2090035.jpg",
  "guide-jewish-quarter": "https://i.ibb.co/Txz1FJQD/2b6ef53ffe23.jpg",
  "guide-andrassy": "https://i.ibb.co/99x7Yxzt/e18ce39c1140.jpg",
  "guide-buda": "https://i.ibb.co/yBMjWmDH/5e7dddeb2089.jpg",
};

const guideCardFallback =
  process.env.NEXT_PUBLIC_IMG_BB_GUIDE_CARD || "https://i.ibb.co/xK672jw6/6a4e4e8ea50c.jpg";

function guideImageForId(id) {
  return (id && GUIDE_IMAGE_BY_ID[id]) || guideCardFallback;
}

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
    ? site.guides.map((g) => {
        const url = typeof g.imageUrl === "string" ? g.imageUrl.trim() : "";
        const useDistinct = !url || url === guideCardFallback;
        return {
          ...g,
          imageUrl: useDistinct ? guideImageForId(g.id) : url,
        };
      })
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
  if (guides) {
    console.log(
      "Guide images:",
      guides.map((g) => ({ id: g.id, imageUrl: g.imageUrl })),
    );
  }
  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
