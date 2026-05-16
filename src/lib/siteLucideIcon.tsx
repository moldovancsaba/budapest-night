import type { ComponentType } from "react";
import type { SiteIconKey } from "@/types/site";
import { Calculator, Compass, Heart, ListChecks, MapPin, ShieldCheck, Users } from "lucide-react";

const MAP: Record<SiteIconKey, ComponentType<{ className?: string }>> = {
  "map-pin": MapPin,
  "list-checks": ListChecks,
  heart: Heart,
  "shield-check": ShieldCheck,
  compass: Compass,
  users: Users,
  calculator: Calculator,
};

export function SiteLucideIcon({ name, className }: { name: SiteIconKey; className?: string }) {
  const Icon = MAP[name] ?? MapPin;
  return <Icon className={className} />;
}
