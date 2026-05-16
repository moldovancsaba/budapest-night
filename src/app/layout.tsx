import type { Metadata } from "next";
import { APP_FAVICON } from "@/config/brand";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: APP_FAVICON.icon, type: "image/png" }],
    apple: [{ url: APP_FAVICON.apple, type: "image/png" }],
    shortcut: APP_FAVICON.shortcut,
  },
};

/** Root layout — locale-specific html/body live under `app/[locale]/layout.tsx`. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
