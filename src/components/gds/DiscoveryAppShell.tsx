"use client";

import type { ReactNode } from "react";
import { AppShell } from "@mantine/core";

type DiscoveryAppShellProps = {
  navbar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  navbarCollapsed: { mobile: boolean; desktop: boolean };
};

/**
 * Sidebar discovery layout (288px nav). Mirrors @gds/admin AppShell regions until
 * a dedicated DiscoveryShell ships in @gds/core.
 */
export function DiscoveryAppShell({
  navbar,
  header,
  children,
  navbarCollapsed,
}: DiscoveryAppShellProps) {
  return (
    <AppShell
      navbar={{
        width: 288,
        breakpoint: "lg",
        collapsed: navbarCollapsed,
      }}
      header={{ height: 64 }}
      padding={0}
      styles={{
        navbar: {
          backgroundColor: "var(--mantine-color-dark-8)",
          borderRightColor: "var(--mantine-color-dark-4)",
        },
      }}
    >
      <AppShell.Navbar p={0}>{navbar}</AppShell.Navbar>
      <AppShell.Header>{header}</AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
