"use client";

import { Anchor, Box, Group } from "@mantine/core";
import { SectionPanel, StatusBadge } from "@/components/gds";
import type { Provider } from "@/types/provider";
import { useLocale, useTranslations } from "next-intl";
import type { AppLocale } from "@/i18n/config";

export function VenueQrSection({ provider }: { provider: Provider }) {
  const locale = useLocale() as AppLocale;
  const tProgram = useTranslations("program");
  const showPartner =
    provider.partnerTier === "listed" ||
    provider.partnerTier === "partner" ||
    provider.isPromoted;

  return (
    <SectionPanel
      title={tProgram("qrTitle")}
      description={tProgram("qrHint")}
      tone="supporting"
    >
      <Group gap="md" align="flex-start">
        <Box
          component="img"
          src={`/api/public/providers/${encodeURIComponent(provider.id)}/qr?locale=${locale}&size=200`}
          alt=""
          width={120}
          height={120}
          style={{
            borderRadius: "var(--mantine-radius-md)",
            border: "1px solid var(--mantine-color-dark-4)",
            background: "var(--mantine-color-dark-6)",
            padding: 8,
          }}
        />
        <Anchor
          href={`/api/public/providers/${encodeURIComponent(provider.id)}/qr?locale=${locale}&size=400`}
          download={`pestiest-${provider.id}-qr.svg`}
          size="sm"
          fw={500}
        >
          {tProgram("qrDownload")}
        </Anchor>
      </Group>
      {showPartner ? (
        <Box mt="sm">
          <StatusBadge status="info">{tProgram("partnerBadge")}</StatusBadge>
        </Box>
      ) : null}
    </SectionPanel>
  );
}
