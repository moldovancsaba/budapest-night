import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Link2 } from "lucide-react";
import type { Provider } from "@/types/provider";
import { toast } from "sonner";

export function ShareDialog({ provider, onClose }: { provider: Provider | null; onClose: () => void }) {
  if (!provider) return null;
  const url = `https://budapestnight.app/p/${provider.id}`;
  const summary = `${provider.name} — ${provider.category} in ${provider.neighborhood}, ${provider.borough}. $${provider.pricePerClass}/class. ${provider.shortDescription}`;

  return (
    <Dialog open={!!provider} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Share {provider.name}</DialogTitle>
          <DialogDescription>Send this provider to a friend or co-parent.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => window.open(`mailto:?subject=${encodeURIComponent(provider.name)}&body=${encodeURIComponent(summary + "\n\n" + url)}`)}
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
              navigator.clipboard.writeText(url);
              toast.success("Link copied");
            }}
          >
            <Link2 className="h-4 w-4" /> Copy link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
