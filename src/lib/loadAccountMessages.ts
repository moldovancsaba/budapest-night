import type { AppLocale } from "@/i18n/config";
import type { SiteAccountSettings } from "@/types/site";

type AccountMessagesModule = { default: { settings: SiteAccountSettings } };

const loaders: Partial<Record<AppLocale, () => Promise<AccountMessagesModule>>> = {
  en: () => import("@/messages/account-en.json") as Promise<AccountMessagesModule>,
  es: () => import("@/messages/account-es.json") as Promise<AccountMessagesModule>,
  it: () => import("@/messages/account-it.json") as Promise<AccountMessagesModule>,
  hu: () => import("@/messages/account-hu.json") as Promise<AccountMessagesModule>,
  he: () => import("@/messages/account-he.json") as Promise<AccountMessagesModule>,
  ar: () => import("@/messages/account-ar.json") as Promise<AccountMessagesModule>,
};

export async function loadAccountSettings(locale: AppLocale): Promise<SiteAccountSettings> {
  const load = loaders[locale] ?? loaders.en;
  const mod = await (load ?? loaders.en)!();
  return mod.default.settings;
}
