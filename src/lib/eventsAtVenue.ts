import type { PublicNightEvent } from "@/lib/publicEvent";

export function eventHostedAtVenue(
  event: Pick<PublicNightEvent, "venueIds" | "venues">,
  providerId: string,
): boolean {
  if (event.venueIds?.includes(providerId)) return true;
  return (event.venues ?? []).some((v) => v.id === providerId);
}

export function eventsForVenue(
  events: PublicNightEvent[],
  providerId: string,
): PublicNightEvent[] {
  return events
    .filter((e) => eventHostedAtVenue(e, providerId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
