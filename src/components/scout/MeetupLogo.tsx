import { Baby, Building2, Heart, Coffee, Blocks, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MeetupGroup } from "@/types/meetup";

const ICONS = {
  stroller: Baby,
  skyline: Building2,
  heart: Heart,
  coffee: Coffee,
  playground: Blocks,
  community: Users,
} as const;

const PALETTES: Record<MeetupGroup["palette"], { bg: string; fg: string; mark: string }> = {
  teal: { bg: "bg-muted", fg: "text-foreground", mark: "bg-primary text-primary-foreground" },
  orange: { bg: "bg-muted", fg: "text-foreground", mark: "bg-primary text-primary-foreground" },
  beige: { bg: "bg-secondary", fg: "text-foreground", mark: "bg-foreground text-background" },
  charcoal: { bg: "bg-foreground", fg: "text-background", mark: "bg-card text-foreground" },
};

export function MeetupLogo({
  group,
  size = "md",
}: {
  group: MeetupGroup;
  size?: "md" | "lg";
}) {
  const Icon = ICONS[group.icon];
  const p = PALETTES[group.palette];
  const dim = size === "lg" ? "h-20 w-20" : "h-14 w-14";
  const iconSize = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  const badgeSize = size === "lg" ? "h-8 w-8 text-xs" : "h-6 w-6 text-[10px]";
  return (
    <div
      className={cn(
        "relative grid place-items-center rounded-full border border-border",
        dim,
        p.bg,
      )}
    >
      <Icon className={cn(iconSize, p.fg)} strokeWidth={1.75} />
      <span
        className={cn(
          "absolute -bottom-1 -right-1 grid place-items-center rounded-full font-display font-bold",
          badgeSize,
          p.mark,
        )}
      >
        {group.initials}
      </span>
    </div>
  );
}
