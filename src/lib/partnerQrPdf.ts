import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { buildPartnerVenueUrl } from "@/lib/partnerQrUrl";
import type { Provider } from "@/types/provider";
import type { AppLocale } from "@/i18n/config";

/** A5 portrait in PDF points (72 pt/in). */
const A5_WIDTH = 419.53;
const A5_HEIGHT = 595.28;

const PDF_COPY: Record<
  AppLocale,
  { scanLine: string; programLine: string; privacy: string }
> = {
  hu: {
    scanLine: "Olvasd be a QR-kódot",
    programLine: "Fedezd fel a heti programot",
    privacy:
      "Adatkezelés: a Pesti Est a helyszín oldalán tájékoztat. Részletek: pestiest.hu",
  },
  en: {
    scanLine: "Scan for program & tickets",
    programLine: "Discover this week's Budapest program",
    privacy: "Privacy: see pestiest.hu for data handling.",
  },
  es: {
    scanLine: "Escanea el código QR",
    programLine: "Descubre el programa semanal",
    privacy: "Privacidad: pestiest.hu",
  },
  it: {
    scanLine: "Scansiona il QR",
    programLine: "Scopri il programma della settimana",
    privacy: "Privacy: pestiest.hu",
  },
  he: {
    scanLine: "סרוק את קוד ה-QR",
    programLine: "גלה את תוכנית השבוע",
    privacy: "פרטיות: pestiest.hu",
  },
  ar: {
    scanLine: "امسح رمز QR",
    programLine: "اكتشف برنامج الأسبوع",
    privacy: "الخصوصية: pestiest.hu",
  },
};

export async function buildPartnerQrPackPdf(
  providers: Provider[],
  locale: AppLocale = "hu",
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  for (const p of providers) {
    const page = pdf.addPage([A5_WIDTH, A5_HEIGHT]);
    const url = buildPartnerVenueUrl(p, locale);
    const copy = PDF_COPY[locale] ?? PDF_COPY.hu;
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
    page.drawText(copy.programLine, {
      x: 40,
      y: 88,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText(copy.scanLine, {
      x: A5_WIDTH / 2 - 48,
      y: 72,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(copy.privacy.slice(0, 90), {
      x: 40,
      y: 40,
      size: 6.5,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });
    page.drawText(p.id, {
      x: A5_WIDTH / 2 - p.id.length * 2.2,
      y: 24,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return pdf.save();
}
