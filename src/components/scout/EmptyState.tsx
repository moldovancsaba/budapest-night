"use client";

import type { ReactNode } from "react";
import { EmptyState as GdsEmptyState } from "@doneisbetter/gds-core/client";
import { Compass, type GdsIconComponent } from "@/components/gds/icons";

export function EmptyState({
  title,
  message,
  icon: Icon = Compass,
  action,
}: {
  title: string;
  message: string;
  icon?: GdsIconComponent;
  action?: ReactNode;
}) {
  return (
    <GdsEmptyState
      title={title}
      description={message}
      icon={<Icon size={32} stroke={1.5} />}
      action={action}
    />
  );
}
