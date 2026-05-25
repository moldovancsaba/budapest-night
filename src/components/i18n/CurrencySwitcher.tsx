"use client";

import { ActionIcon, Menu, Select, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Coins } from "@/components/gds/icons";
import { useTranslations } from "next-intl";
import { useDisplayCurrency } from "@/contexts/DisplayCurrencyContext";
import type { DisplayCurrency } from "@/types/currency";

const OPTIONS: DisplayCurrency[] = ["HUF", "EUR", "USD"];

const CURRENCY_DATA = OPTIONS.map((code) => ({
  value: code,
  label: code,
}));

export function CurrencySwitcher({
  style,
  variant = "default",
}: {
  style?: React.CSSProperties;
  variant?: "default" | "header";
}) {
  const { displayCurrency, setDisplayCurrency } = useDisplayCurrency();
  const t = useTranslations("currency");
  const isHeader = variant === "header";
  const smUp = useMediaQuery("(min-width: 48em)");

  const currencyData = CURRENCY_DATA.map(({ value }) => ({
    value,
    label: t(`option.${value}`),
  }));

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
            <Coins size={16} stroke={1.75} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {OPTIONS.map((code) => (
            <Menu.Item
              key={code}
              onClick={() => setDisplayCurrency(code)}
              fw={code === displayCurrency ? 600 : 400}
            >
              {t(`option.${code}`)}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <Select
      data={currencyData}
      value={displayCurrency}
      onChange={(next) => next && setDisplayCurrency(next as DisplayCurrency)}
      aria-label={t("label")}
      leftSection={<Coins size={16} stroke={1.75} />}
      comboboxProps={{ position: "bottom-end", withinPortal: true }}
      w={isHeader ? undefined : 120}
      radius={isHeader ? "xl" : "md"}
      style={style}
      styles={
        isHeader
          ? {
              input: {
                borderRadius: 9999,
                width: smUp ? "auto" : 40,
                minWidth: smUp ? 100 : 40,
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
