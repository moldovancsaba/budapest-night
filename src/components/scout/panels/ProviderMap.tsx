"use client";

import { Box, Group, Paper, Skeleton, Text, Title } from "@mantine/core";
import { AppButton } from "@/components/mantine/AppButton";
import { useEffect, useState } from "react";
import { Navigation } from "lucide-react";

const BOROUGH_CENTERS: Record<string, [number, number]> = {
  Belváros: [47.4979, 19.0402],
  Terézváros: [47.5069, 19.058],
  Erzsébetváros: [47.5025, 19.0734],
  Ferencváros: [47.4833, 19.075],
  Buda: [47.502, 19.034],
  Óbuda: [47.54, 19.039],
  Újbuda: [47.473, 19.049],
};

export function ProviderMap({
  address,
  borough,
}: {
  address: string;
  borough: string;
}) {
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`,
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data) && data[0]) {
          setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        } else {
          setCoords(BOROUGH_CENTERS[borough] ?? BOROUGH_CENTERS.Belváros);
        }
      })
      .catch(() => {
        if (!cancelled)
          setCoords(BOROUGH_CENTERS[borough] ?? BOROUGH_CENTERS.Belváros);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [address, borough]);

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const bbox = coords
    ? `${coords[1] - 0.005},${coords[0] - 0.003},${coords[1] + 0.005},${coords[0] + 0.003}`
    : "";
  const src = coords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords[0]},${coords[1]}`
    : "";

  return (
    <Paper withBorder radius="xl" p="lg">
      <Title order={4} size="sm" fw={600}>
        Location
      </Title>
      <Box
        mt="sm"
        h={192}
        style={{ overflow: "hidden", borderRadius: "var(--mantine-radius-md)" }}
      >
        {loading || !coords ? (
          <Skeleton height="100%" radius="md" />
        ) : (
          <Box
            component="iframe"
            title={`Map of ${address}`}
            src={src}
            style={{ width: "100%", height: "100%", border: 0 }}
            loading="lazy"
          />
        )}
      </Box>
      <Text size="sm" c="dimmed" mt="sm">
        {address}
      </Text>
      <AppButton
        variant="outline"
        size="sm"
        w="100%"
        mt="sm"
        component="a"
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
      >
        <Group gap="xs" wrap="nowrap" justify="center">
          <Navigation size={16} />
          Get directions
        </Group>
      </AppButton>
    </Paper>
  );
}
