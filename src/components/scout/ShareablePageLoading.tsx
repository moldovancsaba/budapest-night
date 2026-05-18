"use client";

import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

export function ShareablePageLoading() {
  const t = useTranslations("sharePage");

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
