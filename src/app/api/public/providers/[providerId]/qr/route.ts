import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getDb, COL } from "@/lib/mongodb";
import { getVenuePathKey } from "@/lib/providerLocale";
import type { Provider } from "@/types/provider";
import type { AppLocale } from "@/i18n/config";
import { getSiteOrigin } from "@/lib/appPaths";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ providerId: string }> },
) {
  const { providerId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const size = Math.min(512, Math.max(128, Number(searchParams.get("size") ?? 280)));
  const locale = (searchParams.get("locale") ?? "hu") as AppLocale;

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const raw = (await db.collection(COL.providers).findOne({ id: providerId })) as unknown as
    | Provider
    | null;
  if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const slug = getVenuePathKey(raw, locale);
  const origin = getSiteOrigin();
  const localePath = locale === "hu" ? "" : `/${locale}`;
  const url = `${origin}${localePath}/venue/${encodeURIComponent(slug)}?utm_source=pestiest&utm_medium=qr&utm_content=${encodeURIComponent(providerId)}`;

  const svg = await QRCode.toString(url, {
    type: "svg",
    width: size,
    margin: 1,
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
