import { localeLabels } from "@/i18n/config";
import { MENU_BASE_LOCALE, type MenuIngestLocale } from "@/types/menuLocale";
import type { VenueMenu } from "@/types/menu";
import type { Provider } from "@/types/provider";

export const MENU_INGEST_LOCALES: MenuIngestLocale[] = ["hu", "es", "it", "he", "ar"];

export function getMenuLocaleIngestRulesForPrompt(): string {
  const localeList = MENU_INGEST_LOCALES.map((code) => `${code} (${localeLabels[code]})`).join(", ");
  return `### Menu translations (required — Eat & Drink is localized)
- Root \`name\` (items) and \`title\` (sections) are **English** — canonical fallback for "${MENU_BASE_LOCALE}".
- Every menu **item** must include \`locales\` with **all** of: ${localeList}. Each locale needs \`name\` (translated dish/drink as guests would read it). Optional \`description\` when the source has a subtitle or ingredients line.
- Every menu **section** must include \`locales\` with the same keys. Each locale needs \`title\` (e.g. "Drinks" → "Bevande" for it).
- Translate faithfully from the official menu; keep sizes/units (cl, dl, g) and brand names (pálinka, Tokaj) as on the printed menu. Do not translate HUF/EUR prices — prices stay on \`price\` only.
- Tags (\`tags\`), \`kind\`, \`id\`, and \`price\` stay on the root item only — never inside \`locales\`.
- Public API: \`GET /api/public/menu-items?locale=it\` returns resolved names for the active locale.`;
}

export function validateMenuItemLocalesForIngest(
  localesMap: unknown,
  pathPrefix: string,
): string[] {
  const errors: string[] = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(
      `${pathPrefix}: locales object required with keys ${MENU_INGEST_LOCALES.join(", ")} (translate every menu item)`,
    );
    return errors;
  }
  const record = localesMap as Record<string, unknown>;
  for (const code of MENU_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const block = record[code];
    if (!block || typeof block !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    const row = block as Record<string, unknown>;
    if (typeof row.name !== "string" || !row.name.trim()) {
      errors.push(`${p}.name: required non-empty string`);
    }
    if (row.description !== undefined && typeof row.description !== "string") {
      errors.push(`${p}.description: must be string when set`);
    }
    if (row.tags !== undefined) errors.push(`${p}: do not put tags inside locales`);
    if (row.price !== undefined) errors.push(`${p}: do not put price inside locales`);
  }
  if ((record as { en?: unknown }).en !== undefined) {
    errors.push(`${pathPrefix}.locales: do not add "en" — English is the root name/description`);
  }
  return errors;
}

export function validateMenuSectionLocalesForIngest(
  localesMap: unknown,
  pathPrefix: string,
): string[] {
  const errors: string[] = [];
  if (!localesMap || typeof localesMap !== "object") {
    errors.push(
      `${pathPrefix}: locales object required with keys ${MENU_INGEST_LOCALES.join(", ")} (translate every section title)`,
    );
    return errors;
  }
  const record = localesMap as Record<string, unknown>;
  for (const code of MENU_INGEST_LOCALES) {
    const p = `${pathPrefix}.locales.${code}`;
    const block = record[code];
    if (!block || typeof block !== "object") {
      errors.push(`${p}: required`);
      continue;
    }
    const row = block as Record<string, unknown>;
    if (typeof row.title !== "string" || !row.title.trim()) {
      errors.push(`${p}.title: required non-empty string`);
    }
  }
  if ((record as { en?: unknown }).en !== undefined) {
    errors.push(`${pathPrefix}.locales: do not add "en" — English is the root title`);
  }
  return errors;
}

export function validateVenueMenuLocalesForIngest(menu: VenueMenu, pathPrefix: string): string[] {
  const errors: string[] = [];
  if (!menu.sections?.length) return errors;
  menu.sections.forEach((sec, si) => {
    const secPath = `${pathPrefix}.sections[${si}]`;
    errors.push(...validateMenuSectionLocalesForIngest(sec.locales, secPath));
    (sec.items ?? []).forEach((item, ii) => {
      errors.push(
        ...validateMenuItemLocalesForIngest(item.locales, `${secPath}.items[${ii}]`),
      );
    });
  });
  return errors;
}

/** When a provider patch/upsert includes menu or event offering items, require full menu locales. */
export function validateProviderMenuLocalesForIngest(
  provider: Pick<Provider, "menu" | "eventOfferings">,
  pathPrefix: string,
): string[] {
  const errors: string[] = [];
  if (provider.menu?.sections?.length) {
    errors.push(...validateVenueMenuLocalesForIngest(provider.menu, `${pathPrefix}.menu`));
  }
  (provider.eventOfferings ?? []).forEach((ev, ei) => {
    (ev.items ?? []).forEach((item, ii) => {
      errors.push(
        ...validateMenuItemLocalesForIngest(
          item.locales,
          `${pathPrefix}.eventOfferings[${ei}].items[${ii}]`,
        ),
      );
    });
  });
  return errors;
}
