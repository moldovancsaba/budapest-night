"use client";

import { useTranslations } from "next-intl";
import { Group, Loader, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { useSaved } from "@/store/useScout";
import { ProviderCard } from "../ProviderCard";
import { EmptyState } from "../EmptyState";
import { Heart } from "lucide-react";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";
export function SavedView({
  onOpen,
  onShare,
}: {
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
}) {
  const t = useTranslations("saved");
  const { saved } = useSaved();
  const { data: providers = [], isLoading } = useProvidersCatalog();
  const list = providers.filter((p) => saved.includes(p.id));

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={1} size="h2" tt="uppercase" lts="0.02em">
          {t("title")}
        </Title>
        <Text size="sm" c="dimmed">
          {t("subtitle")}
        </Text>
      </Stack>

      {isLoading ? (
        <Group justify="center" py={64}>
          <Loader color="gray" />
        </Group>
      ) : list.length === 0 ? (
        <EmptyState icon={Heart} title={t("emptyTitle")} message={t("emptyMessage")} />
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, xl: 3 }} spacing="md">
          {list.map((p) => (
            <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
