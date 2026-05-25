"use client";

import { StateBlock } from "@/components/gds";
import { useTranslations } from "next-intl";

export function ShareablePageLoading() {
  const t = useTranslations("sharePage");

  return (
    <StateBlock
      variant="loading"
      title={t("loading")}
      compact
    />
  );
}
