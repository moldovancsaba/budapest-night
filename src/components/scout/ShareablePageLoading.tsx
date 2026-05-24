"use client";

import { Center, Loader, Stack, Text } from "@mantine/core";
import { useTranslations } from "next-intl";

export function ShareablePageLoading() {
  const t = useTranslations("sharePage");

  return (
    <Center py="xl" px="md" role="status" aria-live="polite">
      <Stack align="center" gap="md">
        <Loader color="gray" aria-hidden />
        <Text size="sm" c="dimmed">
          {t("loading")}
        </Text>
      </Stack>
    </Center>
  );
}
