"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { NotFoundPage, type NotFoundCopy } from "@/components/scout/NotFoundPage";

export default function NotFound() {
  const t = useTranslations("notFound");
  const excuses = t.raw("excuses") as string[];

  const copy: NotFoundCopy = {
    code: t("code"),
    subtitle: t("subtitle"),
    headline: t("headline"),
    line1: t("line1"),
    line2: t("line2"),
    excusesTitle: t("excusesTitle"),
    excuses: Array.isArray(excuses) ? excuses : [],
    ctaHome: t("ctaHome"),
    ctaEvents: t("ctaEvents"),
    statLabel: t("statLabel"),
    statValue: t("statValue"),
  };

  const PageLink = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <Link href={href} className={className}>
      {children}
    </Link>
  );

  return <NotFoundPage copy={copy} LinkComponent={PageLink} />;
}
