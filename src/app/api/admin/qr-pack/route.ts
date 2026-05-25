import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSiteOrigin } from "@/lib/appPaths";
import { buildPartnerQrPackPdf } from "@/lib/partnerQrPdf";
import type { Provider } from "@/types/provider";
import type { AppLocale } from "@/i18n/config";
import { PARTNER_QR_PRINT_CSS } from "@/theme/printMedia";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function loadProviders(
  db: NonNullable<Awaited<ReturnType<typeof getDb>>>,
  searchParams: URLSearchParams,
): Promise<Provider[]> {
  const partnerOnly = searchParams.get("partner") === "1";
  const idsParam = searchParams.get("ids");

  let providers = (await db.collection(COL.providers).find({}).toArray()) as unknown as Provider[];

  if (idsParam) {
    const ids = new Set(idsParam.split(",").map((s) => s.trim()).filter(Boolean));
    providers = providers.filter((p) => ids.has(p.id));
  } else if (partnerOnly) {
    providers = providers.filter((p) => p.partnerTier === "partner");
  } else {
    providers = providers.filter((p) => p.partnerTier === "partner" || p.isPromoted);
  }

  providers.sort((a, b) => a.name.localeCompare(b.name));
  return providers;
}

/**
 * Partner QR pack — A5 HTML (print) or PDF download.
 * ?format=pdf — application/pdf
 * ?partner=1 — partnerTier=partner only
 * ?ids=prov-a,prov-b — explicit list
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { searchParams } = req.nextUrl;
  const locale = (searchParams.get("locale") ?? "hu") as AppLocale;
  const format = searchParams.get("format") ?? "html";

  const providers = await loadProviders(db, searchParams);
  if (!providers.length) {
    return NextResponse.json({ error: "No matching providers" }, { status: 404 });
  }

  if (format === "pdf") {
    const bytes = await buildPartnerQrPackPdf(providers, locale);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="pestiest-partner-qr-pack.pdf"',
        "Cache-Control": "no-store",
      },
    });
  }

  const origin = getSiteOrigin();
  const pages = providers
    .map((p) => {
      const qrSrc = `${origin}/api/public/providers/${encodeURIComponent(p.id)}/qr?locale=${locale}&size=320`;
      return `
    <section class="page">
      <header>
        <p class="brand">Pesti Est</p>
        <h1>${escapeHtml(p.name)}</h1>
        <p class="sub">${escapeHtml(p.shortDescription ?? "")}</p>
      </header>
      <div class="qr-wrap">
        <img src="${escapeHtml(qrSrc)}" width="280" height="280" alt="QR" />
      </div>
      <p class="hint">Scan for program, tickets &amp; venue page</p>
      <p class="id">${escapeHtml(p.id)}</p>
    </section>`;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8" />
  <title>Pesti Est — Partner QR pack</title>
  <style>${PARTNER_QR_PRINT_CSS}</style>
</head>
<body>
${pages}
<script>if (typeof window !== 'undefined' && new URLSearchParams(location.search).get('print') === '1') window.print();</script>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
