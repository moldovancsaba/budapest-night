"use client";

import { Anchor } from "@mantine/core";
import { StateBlock } from "@/components/gds";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function ShareableMissing({ backHref }: { backHref: string }) {
  const t = useTranslations("sharePage");

  return (
    <StateBlock
      variant="empty"
      title={t("notFoundTitle")}
      description={t("notFoundBody")}
      action={
        <Anchor component={Link} href={backHref} size="sm" fw={600} underline="always">
          {t("back")}
        </Anchor>
      }
    />
  );
}
