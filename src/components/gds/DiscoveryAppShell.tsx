"use client";

import type { ReactNode } from "react";
import { AppShell } from "@mantine/core";

type DiscoveryAppShellProps = {
  navbar: ReactNode;
  header: ReactNode;
  children: ReactNode;
  navbarCollapsed: { mobile: boolean; desktop: boolean };
};

const shellBlack = "#000000";

/**
 * Sidebar discovery layout (288px nav). Mirrors @doneisbetter/gds-admin AppShell regions until
 * a dedicated DiscoveryShell ships in @doneisbetter/gds-core.
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
        root: { backgroundColor: shellBlack },
        header: {
          backgroundColor: shellBlack,
          borderBottom: "none",
        },
        navbar: {
          backgroundColor: shellBlack,
          borderRight: "none",
        },
        main: {
          backgroundColor: shellBlack,
        },
      }}
    >
      <AppShell.Navbar p={0}>{navbar}</AppShell.Navbar>
      <AppShell.Header>{header}</AppShell.Header>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
