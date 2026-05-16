import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Link2 } from "lucide-react";
import type { MeetupGroup } from "@/types/meetup";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { buildAbsoluteGroupUrl } from "@/lib/appShareUrls";
import type { AppLocale } from "@/i18n/config";
import { useVenueLocationLine } from "@/hooks/useVenueDisplay";

export function MeetupShareDialog({
  group,
  onClose,
}: {
  group: MeetupGroup | null;
  onClose: () => void;
}) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("meetup");
  const tv = useTranslations("venue");
  const locationLine = useVenueLocationLine();
  if (!group) return null;
  const url = buildAbsoluteGroupUrl(group.id, locale);
  const summary = `${group.name} — ${locationLine(group.borough, group.neighborhood)}. ${group.description} Instagram: ${group.instagram}`;

  return (
    <Dialog open={!!group} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {t("shareTitle", { name: group.name })}
          </DialogTitle>
          <DialogDescription>{t("shareDescription")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() =>
              window.open(
                `mailto:?subject=${encodeURIComponent(group.name)}&body=${encodeURIComponent(summary + "\n\n" + url)}`,
              )
            }
          >
            <Mail className="h-4 w-4" /> {tv("shareEmail")}
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
            <MessageCircle className="h-4 w-4" /> {tv("shareWhatsapp")}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast.success(tv("linkCopied"));
            }}
          >
            <Link2 className="h-4 w-4" /> {tv("copyLink")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
