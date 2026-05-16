"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function ShareableMissing({ backHref }: { backHref: string }) {
  const t = useTranslations("sharePage");

  return (
    <div className="px-6 py-16 text-center">
      <p className="font-display text-xl font-bold text-foreground">{t("notFoundTitle")}</p>
      <p className="mt-2 text-sm text-muted-foreground">{t("notFoundBody")}</p>
      <Button asChild className="mt-6 bg-primary text-primary-foreground">
        <Link href={backHref}>{t("back")}</Link>
      </Button>
    </div>
  );
}
