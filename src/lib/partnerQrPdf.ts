import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { getVenuePathKey } from "@/lib/providerLocale";
import { getSiteOrigin } from "@/lib/appPaths";
import type { Provider } from "@/types/provider";
import type { AppLocale } from "@/i18n/config";

/** A5 portrait in PDF points (72 pt/in). */
const A5_WIDTH = 419.53;
const A5_HEIGHT = 595.28;

function venueQrUrl(provider: Provider, locale: AppLocale): string {
  const slug = getVenuePathKey(provider, locale);
  const origin = getSiteOrigin();
  const localePath = locale === "hu" ? "" : `/${locale}`;
  return `${origin}${localePath}/venue/${encodeURIComponent(slug)}?utm_source=pestiest&utm_medium=qr&utm_content=${encodeURIComponent(provider.id)}`;
}

export async function buildPartnerQrPackPdf(
  providers: Provider[],
  locale: AppLocale = "hu",
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (const p of providers) {
    const page = pdf.addPage([A5_WIDTH, A5_HEIGHT]);
    const url = venueQrUrl(p, locale);
    const png = await QRCode.toBuffer(url, { type: "png", width: 400, margin: 1 });
    const img = await pdf.embedPng(png);
    const qrSize = 220;
    const x = (A5_WIDTH - qrSize) / 2;

    page.drawText("PESTI EST", {
      x: A5_WIDTH / 2 - 28,
      y: A5_HEIGHT - 48,
      size: 10,
      font,
      color: rgb(0.45, 0.45, 0.45),
    });
    const title = p.name.length > 42 ? `${p.name.slice(0, 40)}…` : p.name;
    page.drawText(title, {
      x: 40,
      y: A5_HEIGHT - 78,
      size: 16,
      font: fontBold,
    });
    const sub = (p.shortDescription ?? "").slice(0, 120);
    if (sub) {
      page.drawText(sub, {
        x: 40,
        y: A5_HEIGHT - 100,
        size: 9,
        font,
        color: rgb(0.35, 0.35, 0.35),
      });
    }
    page.drawImage(img, {
      x,
      y: A5_HEIGHT / 2 - qrSize / 2 - 20,
      width: qrSize,
      height: qrSize,
    });
    page.drawText("Scan for program & tickets", {
      x: A5_WIDTH / 2 - 62,
      y: 72,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(p.id, {
      x: A5_WIDTH / 2 - p.id.length * 2.2,
      y: 52,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return pdf.save();
}
