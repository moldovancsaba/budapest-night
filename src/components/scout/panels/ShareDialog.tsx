import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Link2 } from "lucide-react";
import type { Provider } from "@/types/provider";
import { toast } from "sonner";
import { useVenueShareSummary } from "@/hooks/useVenueDisplay";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteVenueUrl } from "@/lib/appShareUrls";
import type { AppLocale } from "@/i18n/config";

export function ShareDialog({
  provider,
  onClose,
}: {
  provider: Provider | null;
  onClose: () => void;
}) {
  const t = useTranslations("venue");
  const locale = useLocale() as AppLocale;
  const shareSummary = useVenueShareSummary();
  if (!provider) return null;
  const url = buildAbsoluteVenueUrl(provider, locale);
  const summary = shareSummary(provider);

  return (
    <Dialog open={!!provider} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t("shareTitle", { name: provider.name })}
          </DialogTitle>
          <DialogDescription>{t("shareDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `mailto:?subject=${encodeURIComponent(provider.name)}&body=${encodeURIComponent(summary + "\n\n" + url)}`,
              )
            }
          >
            <Mail className="h-4 w-4" /> {t("shareEmail")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(summary + " " + url)}`,
                "_blank",
              )
            }
          >
            <MessageCircle className="h-4 w-4" /> {t("shareWhatsapp")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success(t("linkCopied"));
            }}
          >
            <Link2 className="h-4 w-4" /> {t("copyLink")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
