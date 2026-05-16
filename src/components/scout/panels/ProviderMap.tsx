import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="rounded-2xl border border-border/60 bg-secondary/50 p-5">
      <h3 className="font-display text-sm font-semibold text-foreground">
        Location
      </h3>
      <div className="mt-3 h-48 w-full overflow-hidden rounded-xl bg-muted">
        {loading || !coords ? (
          <div className="h-full w-full animate-pulse bg-muted" />
        ) : (
          <iframe
            title={`Map of ${address}`}
            src={src}
            className="h-full w-full border-0"
            loading="lazy"
          />
        )}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{address}</p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="mt-3 w-full border-border"
      >
        <a href={directionsUrl} target="_blank" rel="noreferrer">
          <Navigation className="h-4 w-4" /> Get directions
        </a>
      </Button>
    </div>
  );
}
