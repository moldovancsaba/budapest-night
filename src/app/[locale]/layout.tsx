import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { APP_FAVICON } from "@/config/brand";
import { routing } from "@/i18n/routing";
import { locales, type AppLocale } from "@/i18n/config";
import { getSiteOrigin } from "@/lib/appPaths";
import { ClientHtmlLocale } from "@/components/i18n/ClientHtmlLocale";

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
  const description =
    locale === "hu"
      ? t("description")
      : `${t("brandSubtitle")} · ${t("description")}`;

  return {
    metadataBase: new URL(siteUrl),
    title: t("title"),
    description,
    authors: [{ name: "Pesti Est" }],
    alternates: {
      canonical: locale === "hu" ? siteUrl : `${siteUrl}/${locale}`,
      languages,
    },
    openGraph: {
      title: t("title"),
      description,
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
    manifest: "/manifest.webmanifest",
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

  return (
    <NextIntlClientProvider messages={messages}>
      <ClientHtmlLocale />
      {children}
    </NextIntlClientProvider>
  );
}
