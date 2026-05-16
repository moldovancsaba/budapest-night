"use client";

import Link from "next/link";
import { NotFoundPage, type NotFoundCopy } from "@/components/scout/NotFoundPage";

const copy: NotFoundCopy = {
  code: "404",
  subtitle: "Signal lost somewhere in District VII",
  headline: "This page went home before last call",
  line1: "You took a wrong turn between the Danube, a ruin bar, and a thermal bath that definitely was not on the map.",
  line2: "Even the map gave up and ordered another pálinka.",
  excusesTitle: "Official explanation (rotating, suspiciously)",
  excuses: [
    "Szimpla Kert absorbed it during a jazz set",
    "It only exists after 3 AM and you are early",
    "The pálinka deleted it for sport",
    "GPS gave up and moved to Buda",
    "A party boat has it now. No refunds.",
  ],
  ctaHome: "Back to the lit streets",
  ctaEvents: "Find real venues",
  statLabel: "Probability this URL exists",
  statValue: "0.0%",
};

export default function NotFound() {
  const PageLink = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <Link href={href} className={className}>
      {children}
    </Link>
  );

  return <NotFoundPage copy={copy} LinkComponent={PageLink} />;
}
