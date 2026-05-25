"use client";

import { Group, Modal, Stack, Text } from "@mantine/core";
import { AppButton } from "@/components/gds/AppButton";
import { Mail, MessageCircle, Link2 } from "@/components/gds/icons";
import type { Provider } from "@/types/provider";
import { notify } from "@/lib/notify";
import { useVenueShareSummary } from "@/hooks/useVenueDisplay";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteVenueFullUrl } from "@/lib/appShareUrls";
import type { AppLocale } from "@/i18n/config";

export function ShareDialog({
  provider,
  onClose,
}: {
  provider: Provider | null;
  onClose: () => void;
}) {
  const t = useTranslations("venue");
  const locale = useLocale() as AppLocale;
  const shareSummary = useVenueShareSummary();
  if (!provider) return null;
  const url = buildAbsoluteVenueFullUrl(provider, locale);
  const summary = shareSummary(provider);

  return (
    <Modal
      opened={!!provider}
      onClose={onClose}
      title={t("shareTitle", { name: provider.name })}
      size="md"
    >
      <Text size="sm" c="dimmed" mb="md">
        {t("shareDescription")}
      </Text>
      <Stack gap="xs">
        <AppButton
          variant="outline"
          w="100%"
          onClick={() =>
            window.open(
              `mailto:?subject=${encodeURIComponent(provider.name)}&body=${encodeURIComponent(summary + "\n\n" + url)}`,
            )
          }
        >
          <Group gap="xs" wrap="nowrap">
            <Mail size={16} />
            {t("shareEmail")}
          </Group>
        </AppButton>
        <AppButton
          variant="outline"
          w="100%"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(summary + " " + url)}`,
              "_blank",
            )
          }
        >
          <Group gap="xs" wrap="nowrap">
            <MessageCircle size={16} />
            {t("shareWhatsapp")}
          </Group>
        </AppButton>
        <AppButton
          variant="outline"
          w="100%"
          onClick={() => {
            navigator.clipboard.writeText(url);
            notify.success(t("linkCopied"));
          }}
        >
          <Group gap="xs" wrap="nowrap">
            <Link2 size={16} />
            {t("copyLink")}
          </Group>
        </AppButton>
      </Stack>
    </Modal>
  );
}
