import type { SiteIconKey } from "@/types/site";
import {
  Calculator,
  Compass,
  GdsIcons,
  Heart,
  ListChecks,
  MapPin,
  type GdsIconComponent,
} from "@/components/gds/icons";

const MAP: Record<SiteIconKey, GdsIconComponent> = {
  "map-pin": MapPin,
  "list-checks": ListChecks,
  heart: Heart,
  "shield-check": GdsIcons.Verify as GdsIconComponent,
  compass: Compass,
  users: GdsIcons.Users as GdsIconComponent,
  calculator: Calculator,
};

export function SiteGdsIcon({
  name,
  size,
  stroke,
}: {
  name: SiteIconKey;
  size?: number | string;
  stroke?: number;
}) {
  const Icon = MAP[name] ?? MapPin;
  return <Icon size={size} stroke={stroke} />;
}
