"use client";

import { Group, Modal, Stack, Text } from "@mantine/core";
import { AppButton, Mail, MessageCircle, SemanticButton } from "@/components/gds";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import { notify } from "@/lib/notify";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteGroupFullUrl } from "@/lib/appShareUrls";
import type { AppLocale } from "@/i18n/config";
import { useVenueLocationLine } from "@/hooks/useVenueDisplay";

export function MeetupShareDialog({
  group,
  onClose,
}: {
  group: PublicMeetupGroup | null;
  onClose: () => void;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("meetup");
  const tv = useTranslations("venue");
  const locationLine = useVenueLocationLine();
  if (!group) return null;
  const url = buildAbsoluteGroupFullUrl(group.id, locale);
  const summary = `${group.name} — ${locationLine(group.borough, group.neighborhood)}. ${group.description} Instagram: ${group.instagram}`;

  return (
    <Modal
      opened={!!group}
      onClose={onClose}
      title={t("shareTitle", { name: group.name })}
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
              `mailto:?subject=${encodeURIComponent(group.name)}&body=${encodeURIComponent(summary + "\n\n" + url)}`,
            )
          }
        >
          <Group gap="xs" wrap="nowrap">
            <Mail size={16} />
            {tv("shareEmail")}
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
            {tv("shareWhatsapp")}
          </Group>
        </AppButton>
        <SemanticButton
          action="copy"
          variant="outline"
          w="100%"
          onClick={() => {
            navigator.clipboard.writeText(url);
            notify.success(tv("linkCopied"));
          }}
        />
      </Stack>
    </Modal>
  );
}
