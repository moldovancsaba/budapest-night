import { mergeThemeOverrides, type MantineColorsTuple } from "@mantine/core";
import { gdsTheme } from "@gds/theme";

/** Pesti Est brand red — hsl(358 72% 46%). */
const brand: MantineColorsTuple = [
  "#fff1f2",
  "#ffe0e3",
  "#ffc2c8",
  "#ff9aa5",
  "#f06b78",
  "#e32636",
  "#c91f2e",
  "#a81926",
  "#87131f",
  "#660e17",
];

/** Neutral ink for monochrome CTAs and surfaces. */
const ink: MantineColorsTuple = [
  "#f5f5f5",
  "#e8e8e8",
  "#d4d4d4",
  "#a3a3a3",
  "#737373",
  "#525252",
  "#404040",
  "#262626",
  "#171717",
  "#0a0a0a",
];

export const pestiestTheme = mergeThemeOverrides(gdsTheme, {
  primaryColor: "brand",
  defaultRadius: "md",
  fontFamily: "var(--font-rubik), var(--font-noto-devanagari), system-ui, sans-serif",
  headings: {
    fontFamily: "var(--font-rubik), var(--font-noto-devanagari), system-ui, sans-serif",
    fontWeight: "600",
    sizes: {
      h1: { fontSize: "1.75rem", lineHeight: "1.2" },
      h2: { fontSize: "1.35rem", lineHeight: "1.25" },
      h3: { fontSize: "1.125rem", lineHeight: "1.3" },
    },
  },
  breakpoints: {
    xs: "36em",
    sm: "48em",
    md: "62em",
    lg: "75em",
    xl: "88em",
  },
  colors: {
    brand,
    ink,
  },
  primaryShade: { light: 5, dark: 4 },
  components: {
    Button: { defaultProps: { size: "md", radius: "md" } },
    TextInput: { defaultProps: { size: "md", radius: "md" } },
    Select: { defaultProps: { size: "md", radius: "md" } },
    Modal: { defaultProps: { centered: true, radius: "lg" } },
    Paper: { defaultProps: { radius: "xl" } },
    Card: { defaultProps: { radius: "xl", padding: "lg", withBorder: true } },
    Title: {
      defaultProps: {
        tt: "uppercase",
      },
    },
  },
});
