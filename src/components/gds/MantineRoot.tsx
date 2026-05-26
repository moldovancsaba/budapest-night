"use client";

import { GdsProvider } from "@doneisbetter/gds-theme/client";
import { usePathname } from "next/navigation";
import { localeFromPathname } from "@/lib/localeFromPath";
import { getGdsMessagesForLocale } from "@/lib/gdsMessages";
import { pestiestTheme } from "@/theme/pestiestTheme";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export function MantineRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const locale = localeFromPathname(pathname);

  return (
    <GdsProvider
      key={locale}
      locale={locale}
      messages={getGdsMessagesForLocale(locale)}
      theme={pestiestTheme}
      defaultColorScheme="dark"
    >
      {children}
    </GdsProvider>
  );
}
