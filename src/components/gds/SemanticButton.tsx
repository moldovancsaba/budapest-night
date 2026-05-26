"use client";

import {
  SemanticButton as GdsSemanticButton,
  type SemanticAction,
} from "@doneisbetter/gds-core/client";

/** Mantine + native button props forwarded to GDS SemanticButton (published 2.6 types are incomplete). */
export type SemanticButtonProps = {
  action: SemanticAction;
  loading?: boolean;
  feedbackState?: "success" | "error" | null;
  feedbackText?: string;
} & Record<string, unknown>;

export function SemanticButton(props: SemanticButtonProps) {
  return (
    <GdsSemanticButton
      {...(props as React.ComponentProps<typeof GdsSemanticButton>)}
    />
  );
}
