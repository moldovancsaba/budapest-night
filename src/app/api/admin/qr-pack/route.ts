import { NextRequest, NextResponse } from "next/server";
import { getDb, COL } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSiteOrigin } from "@/lib/appPaths";
import type { Provider } from "@/types/provider";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Printable A5 HTML pack — open in browser and Print → Save as PDF.
 * ?partner=1 — all partnerTier=partner
 * ?ids=prov-a,prov-b — explicit list
 */
export async function GET(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const db = await getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const { searchParams } = req.nextUrl;
  const partnerOnly = searchParams.get("partner") === "1";
  const idsParam = searchParams.get("ids");
  const locale = searchParams.get("locale") ?? "hu";

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
  if (!providers.length) {
    return NextResponse.json({ error: "No matching providers" }, { status: 404 });
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
  <style>
    @page { size: A5 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; color: #111; }
    .page {
      width: 148mm;
      min-height: 210mm;
      padding: 10mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #666; margin: 0; }
    h1 { font-size: 20px; margin: 8px 0 4px; max-width: 120mm; }
    .sub { font-size: 11px; color: #444; margin: 0 0 12px; max-width: 120mm; }
    .qr-wrap { padding: 8px; border: 1px solid #ddd; border-radius: 8px; background: #fff; }
    .hint { font-size: 10px; color: #666; margin-top: 10px; }
    .id { font-size: 9px; color: #999; margin-top: 4px; }
    @media screen {
      body { background: #eee; padding: 16px; }
      .page { margin: 0 auto 16px; box-shadow: 0 2px 12px rgba(0,0,0,.12); background: #fff; }
    }
  </style>
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
