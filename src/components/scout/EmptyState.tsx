"use client";

import { Compass, type LucideIcon } from "lucide-react";
import { StateBlock } from "@/components/mantine/StateBlock";

export function EmptyState({
  title,
  message,
  icon: Icon = Compass,
}: {
  title: string;
  message: string;
  icon?: LucideIcon;
}) {
  return <StateBlock title={title} message={message} icon={Icon} />;
}
