import type { Metadata } from "next";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import { Noto_Sans_Devanagari, Rubik } from "next/font/google";
import { APP_FAVICON } from "@/config/brand";
import { getRequestLocale } from "@/lib/requestLocale";
import { Providers } from "./providers";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext", "arabic", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: APP_FAVICON.icon, type: "image/png" }],
    apple: [{ url: APP_FAVICON.apple, type: "image/png" }],
    shortcut: APP_FAVICON.shortcut,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getRequestLocale();

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      {...mantineHtmlProps}
      className={`${rubik.variable} ${notoDevanagari.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
