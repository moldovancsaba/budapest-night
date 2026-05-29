"use client";

/**
 * Pesti Est browse chrome — GDS BrowseSurface rhythm without the outer bordered panel
 * and with scope chips that follow the active color scheme (brand, not violet).
 */
export {
  type BrowseSurfaceFilterChip,
  type BrowseSurfaceProps,
  type BrowseSurfaceScopeOption,
} from "@doneisbetter/gds-core/client";

import type { ReactNode } from "react";
import { Badge, Box, Button, Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import {
  DataToolbar,
  StateBlock,
  type BrowseSurfaceProps,
} from "@doneisbetter/gds-core/client";

export function BrowseSurface({
  eyebrow,
  title,
  description,
  resultCount,
  resultLabel = "results",
  activeFilters = [],
  scopeOptions = [],
  scopeLabel = "Scope",
  locationControls,
  primaryControls,
  toolbar,
  sortControl,
  mobileFilters,
  filterDrawer,
  content,
  loading = false,
  loadingTitle = "Loading results",
  loadingDescription = "The browse surface is still synchronizing.",
  error,
  errorTitle = "Unable to load results",
  errorAction,
  empty = false,
  emptyTitle = "No matching results",
  emptyDescription = "Try adjusting your filters or broadening the current scope.",
  emptyAction,
}: BrowseSurfaceProps) {
  const toolbarFilters = activeFilters.map((filter) => ({
    label: typeof filter.label === "string" ? filter.label : `Filter ${filter.id}`,
    onRemove: filter.onRemove,
  }));

  let body: ReactNode = content;

  if (loading) {
    body = (
      <StateBlock
        variant="loading"
        title={loadingTitle}
        description={loadingDescription}
        compact
      />
    );
  } else if (error) {
    body = (
      <StateBlock
        variant="error"
        title={errorTitle}
        description={error}
        action={errorAction ?? emptyAction}
        compact
      />
    );
  } else if (empty) {
    body = (
      <StateBlock
        variant="empty"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        compact
      />
    );
  }

  return (
    <Stack gap="xl">
      <Paper radius="xl" p={{ base: "lg", sm: "xl" }}>
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start" gap="md" wrap="wrap">
            <Stack gap="xs" maw={760}>
              {eyebrow ? (
                <Text size="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: "0.18em" }}>
                  {eyebrow}
                </Text>
              ) : null}
              <Title order={1}>{title}</Title>
              {description ? (
                <Text size="lg" c="dimmed">
                  {description}
                </Text>
              ) : null}
            </Stack>
            <Stack align="flex-end" gap="xs">
              {typeof resultCount === "number" ? (
                <Badge size="lg" radius="xl" variant="light" color="brand">
                  {resultCount} {resultLabel}
                </Badge>
              ) : null}
              {primaryControls}
            </Stack>
          </Group>

          {scopeOptions.length > 0 ? (
            <Stack gap="xs">
              <Text size="sm" fw={600} c="dimmed">
                {scopeLabel}
              </Text>
              <Group gap="xs" wrap="wrap">
                {scopeOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={option.active ? "filled" : "light"}
                    color={option.active ? "brand" : "gray"}
                    radius="xl"
                    size="sm"
                    onClick={option.onSelect}
                  >
                    {option.label}
                  </Button>
                ))}
              </Group>
            </Stack>
          ) : null}

          {locationControls ? (
            <Stack gap="xs">
              <Text size="sm" fw={600} c="dimmed">
                Location
              </Text>
              {locationControls}
            </Stack>
          ) : null}

          {toolbar || sortControl ? (
            <SimpleGrid cols={{ base: 1, lg: sortControl ? 2 : 1 }} spacing="md">
              {toolbar ? (
                <DataToolbar
                  {...toolbar}
                  activeFilters={
                    toolbarFilters.length ? toolbarFilters : toolbar.fallbackActiveFilters
                  }
                />
              ) : (
                <Box />
              )}
              {sortControl ? (
                <Stack gap="xs" align="stretch">
                  <Text size="sm" fw={600} c="dimmed">
                    Sort
                  </Text>
                  {sortControl}
                </Stack>
              ) : null}
            </SimpleGrid>
          ) : null}

          {mobileFilters ? (
            <Stack hiddenFrom="lg" gap="xs">
              <Text size="sm" fw={600} c="dimmed">
                Filters
              </Text>
              {mobileFilters}
            </Stack>
          ) : null}

          {filterDrawer ? <Box hiddenFrom="lg">{filterDrawer}</Box> : null}

          {activeFilters.length > 0 ? (
            <Group gap="xs" wrap="wrap">
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.id}
                  variant="light"
                  color="brand"
                  rightSection={filter.onRemove ? "×" : undefined}
                  style={filter.onRemove ? { cursor: "pointer" } : undefined}
                  onClick={filter.onRemove}
                >
                  {filter.label}
                </Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
      </Paper>

      {body}
    </Stack>
  );
}
