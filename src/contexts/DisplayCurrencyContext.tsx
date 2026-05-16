"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { normalizeRates } from "@/lib/currency";
import { useSiteCatalog } from "@/hooks/useCatalog";
import type { DisplayCurrency, CurrencyRates } from "@/types/currency";
import { DEFAULT_CURRENCY_RATES } from "@/types/currency";

const STORAGE_KEY = "budapest-night-display-currency";

type DisplayCurrencyContextValue = {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (c: DisplayCurrency) => void;
  rates: CurrencyRates;
};

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue | null>(null);

function readStoredCurrency(): DisplayCurrency {
  if (typeof window === "undefined") return "HUF";
  const v = localStorage.getItem(STORAGE_KEY);
  if (v === "EUR" || v === "USD" || v === "HUF") return v;
  return "HUF";
}

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const { data: site } = useSiteCatalog();
  const [displayCurrency, setDisplayCurrencyState] = useState<DisplayCurrency>("HUF");

  useEffect(() => {
    setDisplayCurrencyState(readStoredCurrency());
  }, []);

  const setDisplayCurrency = useCallback((c: DisplayCurrency) => {
    setDisplayCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  const rates = useMemo(
    () => normalizeRates(site?.currencyRates ?? DEFAULT_CURRENCY_RATES),
    [site?.currencyRates],
  );

  const value = useMemo(
    () => ({ displayCurrency, setDisplayCurrency, rates }),
    [displayCurrency, setDisplayCurrency, rates],
  );

  return (
    <DisplayCurrencyContext.Provider value={value}>{children}</DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) {
    return {
      displayCurrency: "HUF",
      setDisplayCurrency: () => {},
      rates: DEFAULT_CURRENCY_RATES,
    };
  }
  return ctx;
}
