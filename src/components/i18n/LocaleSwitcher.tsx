"use client";

import { ActionIcon, Menu, Select, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Languages } from "@/components/gds/icons";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, localeLabels, type AppLocale } from "@/i18n/config";

const LOCALE_DATA = locales.map((code) => ({
  value: code,
  label: localeLabels[code],
}));

export function LocaleSwitcher({
  style,
  variant = "default",
}: {
  style?: React.CSSProperties;
  variant?: "default" | "header";
}) {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("locale");
  const isHeader = variant === "header";
  const smUp = useMediaQuery("(min-width: 48em)");

  const switchLocale = (next: AppLocale) => {
    router.replace(pathname, { locale: next });
  };

  if (isHeader && !smUp) {
    return (
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon
            variant="default"
            size="lg"
            radius="xl"
            aria-label={t("label")}
            style={style}
          >
            <Languages size={16} stroke={1.75} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {locales.map((code) => (
            <Menu.Item
              key={code}
              onClick={() => switchLocale(code)}
              fw={code === locale ? 600 : 400}
            >
              {localeLabels[code]}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Select
      data={LOCALE_DATA}
      value={locale}
      onChange={(next) => next && switchLocale(next as AppLocale)}
      aria-label={t("label")}
      leftSection={<Languages size={16} stroke={1.75} />}
      comboboxProps={{ position: "bottom-end", withinPortal: true }}
      w={isHeader ? undefined : 148}
      radius={isHeader ? "xl" : "md"}
      style={style}
      styles={
        isHeader
          ? {
              input: {
                borderRadius: 9999,
                width: smUp ? "auto" : 40,
                minWidth: smUp ? 120 : 40,
              },
            }
          : undefined
      }
      renderOption={({ option }) => (
        <Text size="sm">{option.label}</Text>
      )}
    />
  );
}
