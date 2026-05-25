"use client";

import type { ReactNode } from "react";
import { ActionIcon, Anchor, Box, Container, Group, Text } from "@mantine/core";
import { SemanticButton } from "@/components/gds";
import { ArrowLeft } from "@/components/gds/icons";
import { useTranslations } from "next-intl";
import { notify } from "@/lib/notify";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/scout/Logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";
import { CurrencySwitcher } from "@/components/i18n/CurrencySwitcher";
import { useSiteCatalog } from "@/hooks/useCatalog";

export function ShareablePageChrome({
  backHref,
  shareUrl,
  title,
  wide = false,
  children,
}: {
  backHref: string;
  shareUrl: string | null;
  title?: string;
  /** Match main app width on desktop (`max-w-[1400px]`) instead of narrow share column. */
  wide?: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("sharePage");
  const tn = useTranslations("nav");
  const { data: site } = useSiteCatalog();

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    notify.success(t("linkCopied"));
  };

  const containerSize = wide ? undefined : "md";
  const containerStyles = wide
    ? { maxWidth: 1400, width: "100%", marginInline: "auto" as const }
    : undefined;

  return (
    <Box style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
      <Box
        component="header"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <Container size={containerSize} px="md" py="sm" style={containerStyles}>
          <Group justify="space-between" gap="sm" wrap="nowrap">
            <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
              <ActionIcon
                component={Link}
                href={backHref}
                variant="default"
                size="xl"
                radius="xl"
                aria-label={t("back")}
              >
                <ArrowLeft size={16} />
              </ActionIcon>
              <Box visibleFrom="sm">
                <Anchor
                  component={Link}
                  href="/"
                  underline="never"
                  c="inherit"
                  aria-label={tn("goHome")}
                >
                  <Group gap="sm" wrap="nowrap">
                    <Logo
                      logoUrl={site?.logoUrl}
                      logoLightUrl={site?.logoLightUrl}
                      withWordmark={false}
                      size={40}
                    />
                    <Text size="sm" fw={700} tt="uppercase" lts="0.08em">
                      {tn("brand")}
                    </Text>
                  </Group>
                </Anchor>
              </Box>
              {title ? (
                <Text size="sm" fw={600} truncate visibleFrom="sm">
                  {title}
                </Text>
              ) : null}
            </Group>
            <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
              {shareUrl ? (
                <SemanticButton
                  action="copy"
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                />
              ) : null}
              <ThemeToggle />
              <CurrencySwitcher variant="header" />
              <LocaleSwitcher variant="header" />
            </Group>
          </Group>
        </Container>
      </Box>
      <Box component="main" style={{ flex: 1 }}>
        <Container size={containerSize} px="md" py="md" style={containerStyles}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
