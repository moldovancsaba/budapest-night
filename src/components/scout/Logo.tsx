"use client";

import { Box, Group, Stack, Text, useMantineColorScheme } from "@mantine/core";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { isBundledBrandLogo, resolveThemeLogoUrl, type ThemeLogoUrls } from "@/config/brand";

export function Logo({
  logoUrl,
  logoLightUrl,
  size = 128,
  withWordmark = false,
  style,
}: ThemeLogoUrls & {
  size?: number;
  withWordmark?: boolean;
  style?: React.CSSProperties;
}) {
  const t = useTranslations("nav");
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "light" ? "light" : "dark";
  const src = resolveThemeLogoUrl(theme, { logoUrl, logoLightUrl });
  const isBundledLogo = isBundledBrandLogo(src);
  const isLight = theme === "light";

  return (
    <Group gap="sm" wrap="nowrap" style={style}>
      <Box
        pos="relative"
        style={{
          width: size,
          height: size,
          flexShrink: 0,
          overflow: "hidden",
          borderRadius: isLight ? undefined : isBundledLogo ? 8 : "50%",
          background: isLight ? "transparent" : "black",
          boxShadow: !isLight && !isBundledLogo ? "0 0 0 2px var(--mantine-color-default-border)" : undefined,
        }}
      >
        <Image
          src={src}
          alt={t("brand")}
          fill
          style={{
            objectFit: "contain",
            objectPosition: "center",
            padding: !isLight && isBundledLogo ? 4 : undefined,
          }}
          sizes={`${size}px`}
          priority={isBundledLogo}
        />
      </Box>
      {withWordmark ? (
        <Stack gap={0} lh={1.2}>
          <Text
            ff="var(--font-rubik), system-ui, sans-serif"
            size="lg"
            fw={700}
            style={{ letterSpacing: "0.2em" }}
            c="gray.0"
          >
            Budapest
          </Text>
          <Text
            ff="var(--font-rubik), system-ui, sans-serif"
            size="11px"
            fw={600}
            style={{ letterSpacing: "0.35em" }}
            c="brand"
          >
            NIGHT
          </Text>
        </Stack>
      ) : null}
    </Group>
  );
}
