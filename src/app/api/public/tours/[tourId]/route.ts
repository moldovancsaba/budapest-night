import { NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { generateTour } from "@/lib/menu/generateTour";
import type { Provider } from "@/types/provider";

export async function GET(req: Request, ctx: { params: Promise<{ tourId: string }> }) {
  const { tourId } = await ctx.params;
  const url = new URL(req.url);
  const seed = url.searchParams.get("seed") ?? `${tourId}-${Date.now()}`;

  const db = await getDb();
  if (!db) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  const providers = (await db.collection(COL.providers).find({}).toArray()) as unknown as Provider[];
  const result = generateTour(providers, tourId, seed);

  if ("error" in result) {
    const status = result.error === "unknown_tour" ? 404 : 422;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({
    tourId,
    seed: result.seed,
    templateId: result.template.id,
    stops: result.stops.map((s) => ({
      providerId: s.provider.id,
      providerName: s.provider.name,
      category: s.provider.category,
      borough: s.provider.borough,
      neighborhood: s.provider.neighborhood,
      address: s.provider.address,
      website: s.provider.website,
      image: s.provider.image,
      highlightItems: s.highlightItems,
    })),
  });
}
