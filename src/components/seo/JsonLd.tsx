export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function eventJsonLd(event: {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  url?: string;
  locationName?: string;
  address?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate ?? event.startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.locationName,
      address: event.address,
    },
    ...(event.url ? { url: event.url } : {}),
  };
}

export function localBusinessJsonLd(venue: {
  name: string;
  description?: string;
  address?: string;
  url?: string;
  telephone?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: venue.name,
    description: venue.description,
    address: venue.address,
    url: venue.url,
    telephone: venue.telephone,
  };
}
