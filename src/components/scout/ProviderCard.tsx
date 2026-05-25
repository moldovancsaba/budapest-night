import {
  Heart,
  Share2,
  Plus,
  MapPin,
  Calendar,
  Megaphone,
} from "@/components/gds/icons";
import Image from "next/image";
import { ActionIcon, Badge, Card, Group, Stack, Text } from "@mantine/core";
import type { Provider } from "@/types/provider";
import { AppButton } from "@/components/gds/AppButton";
import { useSaved, useCalculator } from "@/store/useScout";
import { notify } from "@/lib/notify";
import { CMS_MEDIA } from "@/config/defaultMedia";
import {
  useActivityTypeLabel,
  useAgeRangeLabel,
  useBadgeLabel,
  useDayTimeLabel,
  useFormatVenuePrice,
  useVenueLocationLine,
} from "@/hooks/useVenueDisplay";
import { resolveProviderLocation } from "@/lib/budapestLocation";
import { ProviderRating } from "@/components/scout/ProviderRating";
import { useTranslations } from "next-intl";

interface Props {
  provider: Provider;
  onOpen: (p: Provider) => void;
  onShare: (p: Provider) => void;
}

export function ProviderCard({ provider, onOpen, onShare }: Props) {
  const { isSaved, toggle } = useSaved();
  const { add } = useCalculator();
  const t = useTranslations("venue");
  const tProgram = useTranslations("program");
  const ageLabel = useAgeRangeLabel();
  const dayLabel = useDayTimeLabel();
  const activityLabel = useActivityTypeLabel();
  const badgeLabel = useBadgeLabel();
  const locationLine = useVenueLocationLine();
  const formatPrice = useFormatVenuePrice();
  const saved = isSaved(provider.id);
  const price = formatPrice(provider);
  const located = resolveProviderLocation(provider);

  return (
    <Card radius="xl" p={0} withBorder style={{ overflow: "hidden" }}>
      <Card.Section>
        <div style={{ position: "relative", height: 176, overflow: "hidden" }}>
          <Image
            fill
            src={provider.image?.trim() ? provider.image : CMS_MEDIA.fallbackListing}
            alt={provider.name}
            style={{ objectFit: "cover" }}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        {provider.isPromoted || provider.promotionLabel ? (
          <Stack gap={4} style={{ position: "absolute", top: 12, left: 12, maxWidth: "85%" }}>
            <Badge radius="xl" tt="uppercase" variant="filled" color="brand" size="sm">
              {provider.promotionLabel ?? badgeLabel("Featured")}
            </Badge>
            {provider.promotionLabel ? (
              <Badge radius="sm" variant="light" color="gray" size="xs">
                {tProgram("adDisclosure")}
              </Badge>
            ) : null}
          </Stack>
        ) : provider.badges[0] ? (
          <Badge
            radius="xl"
            tt="uppercase"
            variant="filled"
            color="dark"
            size="sm"
            style={{ position: "absolute", top: 12, left: 12 }}
          >
            {badgeLabel(provider.badges[0])}
          </Badge>
        ) : null}
        {provider.announcementBadge && (
          <Badge
            radius="xl"
            variant="filled"
            color="dark"
            size="sm"
            style={{ position: "absolute", left: 12, bottom: 12 }}
            leftSection={<Megaphone size={12} />}
          >
            {provider.announcementBadge}
          </Badge>
        )}
        <ActionIcon
          onClick={(e) => {
            e.stopPropagation();
            toggle(provider.id);
            notify.success(saved ? t("removed") : t("saved"));
          }}
          aria-label={saved ? t("unsave") : t("save")}
          variant="filled"
          color="dark"
          radius="xl"
          style={{ position: "absolute", top: 12, right: 12 }}
        >
          <Heart
            size={16}
            style={{ fill: saved ? "currentColor" : "none" }}
          />
        </ActionIcon>
      </Card.Section>

      <Stack gap="sm" p="lg" style={{ flex: 1 }}>
        <AppButton variant="subtle" onClick={() => onOpen(provider)} px={0} justify="flex-start" color="gray">
          <Text fw={600} size="lg" ta="left">
            {provider.name}
          </Text>
        </AppButton>
        <Group align="flex-start" gap={6} wrap="nowrap">
          <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <Stack gap={2}>
            <Text size="sm">
              {locationLine(located.borough, located.neighborhood)}
            </Text>
            {located.address ? (
              <Text size="xs" c="dimmed">
                {located.address}
              </Text>
            ) : null}
          </Stack>
        </Group>

        <Text size="xs" c="dimmed">
          {provider.activityTypes.slice(0, 3).map(activityLabel).join(" · ")}
        </Text>

        <Group gap={6}>
          {provider.ageRanges.slice(0, 2).map((a) => (
            <Badge key={a} radius="xl" variant="light" color="gray" size="sm">
              {ageLabel(a)}
            </Badge>
          ))}
          {provider.dayTimeTags.slice(0, 2).map((d) => (
            <Badge key={d} radius="xl" variant="outline" color="gray" size="sm">
              {dayLabel(d)}
            </Badge>
          ))}
        </Group>

        <Group justify="space-between" pt="sm" style={{ borderTop: "1px solid var(--mantine-color-gray-7)" }}>
          <Group gap={4}>
            <Text fw={700} size="lg">
              {price.main}
            </Text>
            {price.suffix && (
              <Text size="xs" c="dimmed">
                {price.suffix}
              </Text>
            )}
          </Group>
          <ProviderRating provider={provider} variant="card" />
        </Group>

        <Group gap="xs">
          {provider.bookingEnabled ? (
            <AppButton
              onClick={() => onOpen(provider)}
              aria-label={t("reserveAt", { name: provider.name })}
              color="brand"
              style={{ flex: 1 }}
            >
              <Calendar size={16} /> {t("reserve")}
            </AppButton>
          ) : (
            <AppButton
              onClick={() => onOpen(provider)}
              color="brand"
              style={{ flex: 1 }}
            >
              {t("viewDetails")}
            </AppButton>
          )}
          <AppButton
            variant="outline"
            aria-label={t("addToBudget")}
            px="sm"
            onClick={() => {
              add(provider.id);
              notify.success(t("addedToBudget", { name: provider.name }));
            }}
          >
            <Plus size={16} />
          </AppButton>
          <AppButton
            variant="outline"
            aria-label={t("share")}
            px="sm"
            onClick={() => onShare(provider)}
          >
            <Share2 size={16} />
          </AppButton>
        </Group>
      </Stack>
    </Card>
  );
}
