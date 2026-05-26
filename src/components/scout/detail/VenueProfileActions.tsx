"use client";

import { Box, Group, SimpleGrid } from "@mantine/core";
import { AppButton, CtaButtonGroup } from "@/components/gds";
import {
  Calendar,
  Heart,
  Mail,
  MessageCircle,
  Plus,
} from "@/components/gds/icons";
import type { Provider } from "@/types/provider";
import { useSaved, useCalculator } from "@/store/useScout";
import { notify } from "@/lib/notify";
import { useTranslations } from "next-intl";

type Props = {
  provider: Provider;
  onShareEmail: () => void;
  onShareWhatsapp: () => void;
};

export function VenueProfileActions({ provider, onShareEmail, onShareWhatsapp }: Props) {
  const t = useTranslations("venue");
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const saved = isSaved(provider.id);

  const budgetButton = (
    <AppButton
      w="100%"
      onClick={() => {
        add(provider.id);
        notify.success(t("addedToBudget", { name: provider.name }));
      }}
    >
      <Group gap="xs" wrap="nowrap" justify="center">
        <Plus size={16} />
        {t("addToBudget")}
      </Group>
    </AppButton>
  );

  const saveButton = (
    <AppButton
      w="100%"
      variant="outline"
      onClick={() => {
        toggle(provider.id);
        notify.success(saved ? t("removed") : t("saved"));
      }}
    >
      <Group gap="xs" wrap="nowrap" justify="center">
        <Heart size={16} fill={saved ? "currentColor" : "none"} />
        {saved ? t("saved") : t("save")}
      </Group>
    </AppButton>
  );

  const shareRow = (
    <SimpleGrid cols={2} spacing="xs">
      <AppButton variant="outline" onClick={onShareEmail}>
        <Group gap="xs" wrap="nowrap" justify="center">
          <Mail size={16} />
          {t("shareEmail")}
        </Group>
      </AppButton>
      <AppButton variant="outline" onClick={onShareWhatsapp}>
        <Group gap="xs" wrap="nowrap" justify="center">
          <MessageCircle size={16} />
          {t("shareWhatsapp")}
        </Group>
      </AppButton>
    </SimpleGrid>
  );

  if (provider.bookingEnabled) {
    return (
      <Box>
        <AppButton
          w="100%"
          mb="sm"
          aria-label={t("reserveAt", { name: provider.name })}
          onClick={() => notify.success(t("bookingSoon"))}
        >
          <Group gap="xs" wrap="nowrap" justify="center">
            <Calendar size={16} />
            {t("reserve")}
          </Group>
        </AppButton>
        <CtaButtonGroup primary={budgetButton} secondary={saveButton} tertiary={shareRow} />
      </Box>
    );
  }

  return <CtaButtonGroup primary={budgetButton} secondary={saveButton} tertiary={shareRow} />;
}
