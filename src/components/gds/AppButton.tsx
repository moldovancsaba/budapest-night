"use client";

import { Button, type ButtonProps, useMantineColorScheme } from "@mantine/core";
import { forwardRef } from "react";

type LegacyVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

const LEGACY_VARIANTS = new Set<string>([
  "default",
  "destructive",
  "outline",
  "secondary",
  "ghost",
  "link",
]);

function isLegacyVariant(value: unknown): value is LegacyVariant {
  return typeof value === "string" && LEGACY_VARIANTS.has(value);
}

export type AppButtonProps = Omit<ButtonProps, "variant"> & {
  /** @deprecated Prefer Mantine `variant` / `color`; mapped for remaining call sites. */
  variant?: LegacyVariant | ButtonProps["variant"];
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
};

function mapLegacyVariant(
  variant: LegacyVariant,
  colorScheme: "light" | "dark" | "auto",
): Pick<ButtonProps, "variant" | "color"> {
  const isDark = colorScheme === "dark";

  switch (variant) {
    case "destructive":
      return { variant: "filled", color: "brand" };
    case "outline":
      return { variant: "outline", color: isDark ? "gray" : "ink" };
    case "secondary":
      return { variant: "light", color: isDark ? "gray" : "ink" };
    case "ghost":
      return { variant: "subtle", color: isDark ? "gray" : "ink" };
    case "link":
      return { variant: "transparent", color: isDark ? "gray" : "ink" };
    case "default":
    default:
      return isDark ? { variant: "white" } : { variant: "filled", color: "ink" };
  }
}

function AppButtonInner(
  { variant, color, styles, type, ...props }: AppButtonProps,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const { colorScheme } = useMantineColorScheme();

  const mapped = isLegacyVariant(variant)
    ? mapLegacyVariant(variant, colorScheme)
    : { variant: variant as ButtonProps["variant"], color };

  const linkStyles =
    isLegacyVariant(variant) && variant === "link"
      ? {
          root: {
            paddingInline: 0,
            height: "auto",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          },
        }
      : undefined;

  return (
    <Button
      ref={ref}
      type={type}
      {...mapped}
      {...props}
      styles={linkStyles ? { ...linkStyles, ...styles } : styles}
    />
  );
}

/** Mantine button using GDS theme tokens. */
export const AppButton = forwardRef(AppButtonInner) as unknown as typeof Button;

AppButton.displayName = "AppButton";
