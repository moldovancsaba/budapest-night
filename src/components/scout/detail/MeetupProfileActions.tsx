"use client";

import { Group, SimpleGrid } from "@mantine/core";
import { AppButton, CtaButtonGroup } from "@/components/gds";
import { Heart, Mail, MessageCircle, Globe } from "@/components/gds/icons";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import { useSaved } from "@/store/useScout";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";

type Props = {
  group: PublicMeetupGroup;
  websiteUrl: string;
  onShareEmail: () => void;
  onShareWhatsapp: () => void;
};

export function MeetupProfileActions({
  group,
  websiteUrl,
  onShareEmail,
  onShareWhatsapp,
}: Props) {
  const t = useTranslations("meetup");
  const tv = useTranslations("venue");
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(group.id);

  const saveButton = (
    <AppButton
      w="100%"
      onClick={() => {
        toggle(group.id);
        notify.success(saved ? tv("removed") : tv("savedGroup"));
      }}
    >
      <Group gap="xs" wrap="nowrap" justify="center">
        <Heart size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? t("unsave") : t("save")}
      </Group>
    </AppButton>
  );

  const websiteButton = (
    <AppButton
      w="100%"
      variant="outline"
      component="a"
      href={websiteUrl}
      target="_blank"
      rel="noreferrer"
    >
      <Group gap="xs" wrap="nowrap" justify="center">
        <Globe size={16} />
        {t("visitWebsite")}
      </Group>
    </AppButton>
  );

  const shareRow = (
    <SimpleGrid cols={2} spacing="xs">
      <AppButton variant="outline" onClick={onShareEmail}>
        <Group gap="xs" wrap="nowrap" justify="center">
          <Mail size={16} />
          {tv("shareEmail")}
        </Group>
      </AppButton>
      <AppButton variant="outline" onClick={onShareWhatsapp}>
        <Group gap="xs" wrap="nowrap" justify="center">
          <MessageCircle size={16} />
          {tv("shareWhatsapp")}
        </Group>
      </AppButton>
    </SimpleGrid>
  );

  return <CtaButtonGroup primary={saveButton} secondary={websiteButton} tertiary={shareRow} />;
}
