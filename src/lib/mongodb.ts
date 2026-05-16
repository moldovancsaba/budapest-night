import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
let clientPromise: Promise<MongoClient> | null = null;

export function getMongoUri(): string | undefined {
  return uri;
}

export async function getMongoClient(): Promise<MongoClient | null> {
  if (!uri) return null;
  if (clientPromise) return clientPromise;
  clientPromise = MongoClient.connect(uri);
  return clientPromise;
}

export async function getDb(): Promise<Db | null> {
  const c = await getMongoClient();
  if (!c) return null;
  const name = process.env.MONGODB_DB ?? "classscout";
  return c.db(name);
}

export const COL = {
  providers: "providers",
  meetupGroups: "meetupGroups",
  locations: "locations",
  site: "site",
  brain: "brainSettings",
} as const;
