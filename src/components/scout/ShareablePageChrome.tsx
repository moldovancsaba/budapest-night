"use client";

import type { ReactNode } from "react";
import { Link2, ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/scout/Logo";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { ThemeToggle } from "@/components/i18n/ThemeToggle";
import { CurrencySwitcher } from "@/components/i18n/CurrencySwitcher";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSiteCatalog } from "@/hooks/useCatalog";

export function ShareablePageChrome({
  backHref,
  shareUrl,
  title,
  wide = false,
  children,
}: {
  backHref: string;
  shareUrl: string | null;
  title?: string;
  /** Match main app width on desktop (`max-w-[1400px]`) instead of narrow share column. */
  wide?: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("sharePage");
  const tn = useTranslations("nav");
  const { data: site } = useSiteCatalog();

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast.success(t("linkCopied"));
  };

  const containerClass = wide
    ? "mx-auto w-full max-w-3xl px-4 sm:px-6 lg:max-w-[1400px] lg:px-8"
    : "mx-auto w-full max-w-3xl px-4 sm:px-6";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background">
        <div className={cn("flex items-center justify-between gap-3 py-3", containerClass)}>
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href={backHref}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground hover:border-foreground/40"
              aria-label={t("back")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-full transition-opacity hover:opacity-80 sm:flex"
              aria-label={tn("goHome")}
            >
              <Logo logoUrl={site?.logoUrl} withWordmark={false} size={40} />
              <span className="font-display text-sm font-bold tracking-widest text-foreground">
                {tn("brand")}
              </span>
            </Link>
            {title ? (
              <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">
                {title}
              </p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {shareUrl ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={copyLink}
              >
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">{t("copyLink")}</span>
              </Button>
            ) : null}
            <ThemeToggle />
            <CurrencySwitcher variant="header" />
            <LocaleSwitcher variant="header" />
          </div>
        </div>
      </header>
      <main className={cn("flex-1", containerClass)}>{children}</main>
    </div>
  );
}