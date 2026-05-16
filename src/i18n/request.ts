import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { AppLocale } from "./config";
import { mergeMessages } from "@/lib/i18nMerge";
import { loadAccountSettings } from "@/lib/loadAccountMessages";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const appLocale = locale as AppLocale;

  const messages = (await import(`../messages/${appLocale}.json`)).default as Record<
    string,
    unknown
  >;

  if (appLocale !== "en") {
    const en = (await import("../messages/en.json")).default as Record<string, unknown>;
    Object.assign(messages, mergeMessages(messages, en));
  }

  messages.account = { settings: await loadAccountSettings(appLocale) };

  return {
    locale: appLocale,
    messages,
  };
});
