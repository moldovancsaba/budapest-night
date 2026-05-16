/**
 * Upload per-venue raster assets to ImgBB and set provider.image / meetup coverImageUrl in Mongo.
 * Does not wipe or replace listing documents.
 *
 *   npm run db:patch-listing-images
 */
import { config as loadEnv } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { MongoClient } from "mongodb";

loadEnv({ path: path.join(process.cwd(), ".env") });
loadEnv({ path: path.join(process.cwd(), ".env.local"), override: true });

const ASSETS = path.join(process.cwd(), "scripts/imgbb-asset-sources/providers");

const PROVIDER_IMAGES: Record<string, string> = {
  "prov-szimpla-kert-erzsebetvaros": "szimpla-kert.jpg",
  "prov-new-york-cafe-belvaros": "new-york-cafe.jpg",
  "prov-gerbeaud-belvaros": "gerbeaud.jpg",
  "prov-a38-ferencvaros": "a38-ship.jpg",
};

const MEETUP_IMAGES: Record<string, string> = {
  "grp-budapest-art-walk-terezvaros": "culture-walk.jpg",
};

async function uploadFile(filePath: string): Promise<string> {
  const key = process.env.IMGBB_API_KEY?.trim();
  if (!key) throw new Error("Missing IMGBB_API_KEY");
  const buf = fs.readFileSync(filePath);
  const body = new URLSearchParams();
  body.set("key", key);
  body.set("image", buf.toString("base64"));
  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const json = (await res.json()) as {
    success?: boolean;
    data?: { url?: string; display_url?: string };
    error?: { message?: string };
  };
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || `ImgBB HTTP ${res.status}`);
  }
  const url = json.data?.url || json.data?.display_url;
  if (!url) throw new Error("ImgBB response missing url");
  return url;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB ?? "budapest-night";
  if (!uri) throw new Error("Missing MONGODB_URI");

  const uploaded: Record<string, string> = {};

  for (const [id, file] of Object.entries({ ...PROVIDER_IMAGES, ...MEETUP_IMAGES })) {
    const fp = path.join(ASSETS, file);
    if (!fs.existsSync(fp)) throw new Error(`Missing asset: ${fp}`);
    const url = await uploadFile(fp);
    uploaded[id] = url;
    console.log(`${id} -> ${url}`);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  for (const [id, url] of Object.entries(PROVIDER_IMAGES)) {
    const imageUrl = uploaded[id];
    const r = await db.collection("providers").updateOne({ id }, { $set: { image: imageUrl } });
    if (r.matchedCount === 0) console.warn(`provider not found: ${id}`);
  }

  for (const [id, url] of Object.entries(MEETUP_IMAGES)) {
    const imageUrl = uploaded[id];
    const r = await db.collection("meetupGroups").updateOne({ id }, { $set: { coverImageUrl: imageUrl } });
    if (r.matchedCount === 0) console.warn(`meetupGroup not found: ${id}`);
  }

  await client.close();
  console.log("\nPatched listing images in Mongo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
