import type { AppLocale } from "@/i18n/config";
import type { MenuItem, MenuSection } from "@/types/menu";
import type { MenuItemLocaleContent, MenuSectionLocaleContent } from "@/types/menuLocale";
import { MENU_BASE_LOCALE } from "@/types/menuLocale";

function pickItemOverlay(variant: MenuItemLocaleContent): Partial<MenuItem> {
  const out: Partial<MenuItem> = { name: variant.name.trim() };
  if (variant.description?.trim()) out.description = variant.description.trim();
  return out;
}

function pickSectionOverlay(variant: MenuSectionLocaleContent): Partial<MenuSection> {
  return { title: variant.title.trim() };
}

export function resolveMenuItemForLocale(item: MenuItem, locale: AppLocale): MenuItem {
  if (locale === MENU_BASE_LOCALE) return item;
  const variant = item.locales?.[locale as keyof typeof item.locales];
  if (!variant?.name?.trim()) return item;
  return { ...item, ...pickItemOverlay(variant) };
}

export function resolveMenuSectionForLocale(section: MenuSection, locale: AppLocale): MenuSection {
  if (locale === MENU_BASE_LOCALE) return section;
  const variant = section.locales?.[locale as keyof typeof section.locales];
  if (!variant?.title?.trim()) return section;
  return { ...section, ...pickSectionOverlay(variant) };
}
