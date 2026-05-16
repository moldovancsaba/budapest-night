import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Link2 } from "lucide-react";
import type { MeetupGroup } from "@/types/meetup";
import { toast } from "sonner";

export function MeetupShareDialog({ group, onClose }: { group: MeetupGroup | null; onClose: () => void }) {
  if (!group) return null;
  const url = `https://${group.website.replace(/^https?:\/\//, "")}`;
  const summary = `${group.name} — ${group.neighborhood}, ${group.borough}. ${group.description} Instagram: ${group.instagram} • ${group.website}`;

  return (
    <Dialog open={!!group} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share {group.name}</DialogTitle>
          <DialogDescription>Send this meet-up group to a friend or co-parent.</DialogDescription>
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
            <Mail className="h-4 w-4" /> Share via email
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(summary + " " + url)}`, "_blank")}
          >
            <MessageCircle className="h-4 w-4" /> Share via WhatsApp
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              navigator.clipboard.writeText(group.website);
              toast.success("Website copied");
            }}
          >
            <Link2 className="h-4 w-4" /> Copy website
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}