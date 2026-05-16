"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { MapPin, Martini, Music2, Sparkles, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CYBER_PANEL } from "@/lib/cyberTheme";
import { cn } from "@/lib/utils";

export type NotFoundCopy = {
  code: string;
  headline: string;
  subtitle: string;
  line1: string;
  line2: string;
  excusesTitle: string;
  excuses: string[];
  ctaHome: string;
  ctaEvents: string;
  statLabel: string;
  statValue: string;
};

type PageLinkProps = { href: string; className?: string; children: ReactNode; [key: string]: unknown };

export function NotFoundPage({
  copy,
  LinkComponent,
}: {
  copy: NotFoundCopy;
  LinkComponent: ComponentType<PageLinkProps>;
}) {
  const Link = LinkComponent;
  const [excuseIdx, setExcuseIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const excuseTimer = setInterval(() => {
      setExcuseIdx((i) => (i + 1) % copy.excuses.length);
    }, 3200);
    const glitchTimer = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 4000);
    return () => {
      clearInterval(excuseTimer);
      clearInterval(glitchTimer);
    };
  }, [copy.excuses.length]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,hsl(310_100%_50%_/_0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,hsl(180_100%_50%_/_0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute left-[8%] top-[18%] text-accent/20">
        <Martini className="h-16 w-16 animate-pulse" />
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[22%] text-primary/25">
        <Music2 className="h-14 w-14 animate-pulse" style={{ animationDelay: "0.6s" }} />
      </div>
      <div className="pointer-events-none absolute bottom-[20%] left-[12%] text-primary/20">
        <MapPin className="h-12 w-12 animate-pulse" style={{ animationDelay: "1.1s" }} />
      </div>

      <div className={cn("relative z-10 w-full max-w-2xl text-center", CYBER_PANEL, "p-8 sm:p-12")}>
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          {copy.subtitle}
          <Sparkles className="h-3.5 w-3.5" />
        </p>

        <h1
          className={cn(
            "mt-4 font-display text-[clamp(5rem,22vw,9rem)] font-bold leading-none tracking-tighter neon-text transition-transform",
            glitch && "translate-x-[2px] skew-x-1",
          )}
          aria-hidden
        >
          {copy.code}
        </h1>

        <h2 className="mt-2 font-display text-2xl font-bold text-foreground sm:text-3xl">{copy.headline}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{copy.line1}</p>
        <p className="mt-2 text-sm italic text-muted-foreground/90">{copy.line2}</p>

        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border/60 bg-card/60 px-5 py-4 backdrop-blur-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{copy.excusesTitle}</p>
          <p
            key={excuseIdx}
            className="mt-2 min-h-[2.5rem] font-display text-base font-semibold text-accent animate-in fade-in duration-300"
          >
            “{copy.excuses[excuseIdx] ?? "…"}”
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span>{copy.statLabel}</span>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 font-mono font-bold text-primary">{copy.statValue}</span>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            size="lg"
            className="w-full rounded-full bg-primary px-6 text-primary-foreground shadow-[0_0_24px_hsl(310_100%_62%_/_0.35)] hover:bg-primary/90 sm:w-auto"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              {copy.ctaHome}
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="w-full rounded-full border-accent/40 bg-accent/10 px-6 text-accent hover:bg-accent/20 sm:w-auto"
          >
            <Link href="/events">
              {copy.ctaEvents}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
