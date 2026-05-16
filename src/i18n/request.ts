import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import type { AppLocale } from "./config";
import { mergeMessages } from "@/lib/i18nMerge";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as AppLocale)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../messages/${locale}.json`)).default as Record<
    string,
    unknown
  >;

  if (locale !== "en") {
    const en = (await import("../messages/en.json")).default as Record<string, unknown>;
    Object.assign(messages, mergeMessages(messages, en));
  }

  if (locale === "hu") {
    const accountHu = (await import("../messages/account-hu.json")).default;
    messages.account = accountHu;
  }

  return {
    locale,
    messages,
  };
});
