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
  offers?: { price: number; currency: string; name?: string }[];
}) {
  const offerList =
    event.offers?.length &&
    event.offers.map((o) => ({
      "@type": "Offer",
      name: o.name ?? "Admission",
      price: o.price,
      priceCurrency: o.currency === "FREE" ? "HUF" : o.currency,
      availability: "https://schema.org/InStock",
    }));

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
    ...(offerList ? { offers: offerList } : {}),
  };
}

export function collectionPageJsonLd(page: {
  name: string;
  description?: string;
  url: string;
  items: { name: string; url?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: page.name,
    description: page.description,
    url: page.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.url ? { url: item.url } : {}),
      })),
    },
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
