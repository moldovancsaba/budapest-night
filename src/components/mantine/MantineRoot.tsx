"use client";

import { DirectionProvider, MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { usePathname } from "next/navigation";
import { pestiestTheme } from "@/theme/pestiestTheme";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

function usePathDirection(): "ltr" | "rtl" {
  const pathname = usePathname() ?? "";
  const seg = pathname.split("/").filter(Boolean)[0];
  return seg === "ar" || seg === "he" ? "rtl" : "ltr";
}

export function MantineRoot({ children }: { children: React.ReactNode }) {
  const dir = usePathDirection();

  return (
    <DirectionProvider initialDirection={dir} key={dir}>
      <MantineProvider theme={pestiestTheme} defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications position="top-right" zIndex={1000} />
          {children}
        </ModalsProvider>
      </MantineProvider>
    </DirectionProvider>
  );
}
