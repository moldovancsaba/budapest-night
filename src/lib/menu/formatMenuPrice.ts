import type { MenuPrice } from "@/types/menu";

export function formatMenuPrice(price: MenuPrice): { main: string; suffix?: string } {
  const sym = price.currency === "HUF" ? "Ft" : "€";
  const main =
    price.currency === "HUF"
      ? `${Math.round(price.amount).toLocaleString("hu-HU")} ${sym}`
      : `${sym}${price.amount}`;
  const unitLabels: Record<NonNullable<MenuPrice["unit"]>, string> = {
    each: "",
    glass: "/ glass",
    bottle: "/ bottle",
    portion: "/ portion",
    ticket: "/ ticket",
  };
  const suffix = price.unit ? unitLabels[price.unit] : undefined;
  return { main, suffix };
}
