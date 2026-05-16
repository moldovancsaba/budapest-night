import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Budapest Night — Events, Parties, Food & Culture",
  description:
    "Discover Budapest nightlife, parties, restaurants, cafés, and culture by district and neighborhood. Neon-lit local guide for the city after dark.",
  authors: [{ name: "Budapest Night" }],
  openGraph: {
    title: "Budapest Night — The city after dark",
    description:
      "Events, parties, restaurants, cafés, and culture across Budapest — curated by district.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
