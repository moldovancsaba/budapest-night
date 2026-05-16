"use client";

import { useTranslations } from "next-intl";
import { useSaved } from "@/store/useScout";
import { ProviderCard } from "../ProviderCard";
import { EmptyState } from "../EmptyState";
import { Heart, Loader2 } from "lucide-react";
import type { Provider } from "@/types/provider";
import { useProvidersCatalog } from "@/hooks/useCatalog";

export function SavedView({ onOpen, onShare }: { onOpen: (p: Provider) => void; onShare: (p: Provider) => void }) {
  const t = useTranslations("saved");
  const { saved } = useSaved();
  const { data: providers = [], isLoading } = useProvidersCatalog();
  const list = providers.filter((p) => saved.includes(p.id));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState icon={Heart} title={t("emptyTitle")} message={t("emptyMessage")} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((p) => (
            <ProviderCard key={p.id} provider={p} onOpen={onOpen} onShare={onShare} />
          ))}
        </div>
      )}
    </div>
  );
}
