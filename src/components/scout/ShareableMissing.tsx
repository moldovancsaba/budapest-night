"use client";

import { Anchor, Stack, Text, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function ShareableMissing({ backHref }: { backHref: string }) {
  const t = useTranslations("sharePage");

  return (
    <Stack px="lg" py={64} align="center" ta="center" gap="sm">
      <Title order={2} size="h3" tt="uppercase" lts="0.04em">
        {t("notFoundTitle")}
      </Title>
      <Text size="sm" c="dimmed" maw={360}>
        {t("notFoundBody")}
      </Text>
      <Anchor component={Link} href={backHref} size="sm" fw={600} mt="md" underline="always">
        {t("back")}
      </Anchor>
    </Stack>
  );
}
