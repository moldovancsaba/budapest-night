import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Noto_Sans_Devanagari, Rubik } from "next/font/google";
import { Providers } from "../providers";
import { APP_FAVICON } from "@/config/brand";
import { routing } from "@/i18n/routing";
import { isRtlLocale, locales, type AppLocale } from "@/i18n/config";
import { getSiteOrigin } from "@/lib/appPaths";
import "../globals.css";

/** Display + UI sans: HU (latin-ext), AR, HE, RU (cyrillic), EN/ES/IT. */
const rubik = Rubik({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "arabic", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

/** Hindi (Devanagari) fallback when Rubik has no glyphs. */
const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const siteUrl = getSiteOrigin();
  const languages: Record<string, string> = {};
  for (const loc of locales) {
    languages[loc] = loc === "hu" ? siteUrl : `${siteUrl}/${loc}`;
  }
  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description: t("description"),
    authors: [{ name: "Pesti Est" }],
    alternates: {
      canonical: locale === "hu" ? siteUrl : `${siteUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale,
      siteName: "Pesti Est",
    },
    twitter: { card: "summary_large_image" },
    icons: {
      icon: [{ url: APP_FAVICON.icon, type: "image/png" }],
      apple: [{ url: APP_FAVICON.apple, type: "image/png" }],
      shortcut: APP_FAVICON.shortcut,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${rubik.variable} ${notoDevanagari.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
