"use client";

import { Anchor, Group, Stack } from "@mantine/core";
import { AccentPanel } from "@/components/gds";
import { Globe, Mail, Phone } from "@/components/gds/icons";
import type { Provider } from "@/types/provider";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { buildProgramPath } from "@/lib/appPaths";
import type { AppLocale } from "@/i18n/config";

export function VenueContactSection({ provider }: { provider: Provider }) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("venue");
  const tProgram = useTranslations("program");

  return (
    <AccentPanel tone="gray" variant="soft-outline" title={t("contactVenue")}>
      <Stack gap="xs">
        <Anchor href={`mailto:${provider.email}`} size="sm" c="inherit" underline="hover">
          <Group gap="xs" wrap="nowrap">
            <Mail size={16} />
            {provider.email}
          </Group>
        </Anchor>
        <Anchor
          href={provider.website}
          target="_blank"
          rel="noreferrer"
          size="sm"
          c="inherit"
          underline="hover"
        >
          <Group gap="xs" wrap="nowrap">
            <Globe size={16} />
            {provider.website}
          </Group>
        </Anchor>
        {provider.externalProgramUrl ? (
          <Anchor
            href={provider.externalProgramUrl}
            target="_blank"
            rel="noreferrer"
            size="sm"
            c="inherit"
            underline="hover"
          >
            <Group gap="xs" wrap="nowrap">
              <Globe size={16} />
              {tProgram("officialProgram")}
            </Group>
          </Anchor>
        ) : null}
        {provider.repertoireUrl ? (
          <Anchor
            href={provider.repertoireUrl}
            target="_blank"
            rel="noreferrer"
            size="sm"
            c="inherit"
            underline="hover"
          >
            <Group gap="xs" wrap="nowrap">
              <Globe size={16} />
              {tProgram("repertoire")}
            </Group>
          </Anchor>
        ) : null}
        <Anchor
          component={Link}
          href={buildProgramPath(undefined, { locale })}
          size="sm"
          fw={500}
          c="inherit"
          underline="hover"
        >
          {tProgram("moreThisWeek")}
        </Anchor>
        <Anchor href={`tel:${provider.phone}`} size="sm" c="inherit" underline="hover">
          <Group gap="xs" wrap="nowrap">
            <Phone size={16} />
            {provider.phone}
          </Group>
        </Anchor>
      </Stack>
    </AccentPanel>
  );
}
