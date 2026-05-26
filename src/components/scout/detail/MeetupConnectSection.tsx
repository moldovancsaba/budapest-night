"use client";

import { Anchor, Group, Stack } from "@mantine/core";
import { AccentPanel } from "@/components/gds";
import { Globe, Instagram } from "@/components/gds/icons";
import type { PublicMeetupGroup } from "@/lib/publicMeetup";
import { useTranslations } from "next-intl";

export function MeetupConnectSection({
  group,
  websiteUrl,
}: {
  group: PublicMeetupGroup;
  websiteUrl: string;
}) {
  const t = useTranslations("meetup");

  return (
    <AccentPanel tone="gray" variant="soft-outline" title={t("connect")}>
      <Stack gap="xs">
        <Anchor
          href={`https://instagram.com/${group.instagram.replace(/^@/, "")}`}
          target="_blank"
          rel="noreferrer"
          size="sm"
          c="inherit"
          underline="hover"
        >
          <Group gap="xs" wrap="nowrap">
            <Instagram size={16} />
            {group.instagram}
          </Group>
        </Anchor>
        <Anchor
          href={websiteUrl}
          target="_blank"
          rel="noreferrer"
          size="sm"
          c="inherit"
          underline="hover"
        >
          <Group gap="xs" wrap="nowrap">
            <Globe size={16} />
            {group.website}
          </Group>
        </Anchor>
      </Stack>
    </AccentPanel>
  );
}
