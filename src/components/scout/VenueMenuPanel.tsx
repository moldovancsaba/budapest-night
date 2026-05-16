"use client";

import type { Provider } from "@/types/provider";
import type { EventOffering, VenueMenu } from "@/types/menu";
import { useFormatMenuPrice } from "@/hooks/useFormatMenuPrice";
import { useTranslations } from "next-intl";
import { inferMenuItemKind } from "@/lib/menu/flattenMenuItems";
import { menuTagMatchesItemKind, menuTagMessageKey } from "@/data/menuTags";
import type { MenuSectionKind } from "@/types/menu";

function sectionKindLabel(
  kind: MenuSectionKind,
  tMenu: ReturnType<typeof useTranslations<"menu">>,
): string {
  if (kind === "food") return tMenu("sectionKind.food");
  if (kind === "drink") return tMenu("sectionKind.drink");
  return tMenu("sectionKind.mixed");
}

function MenuBlock({
  menu,
  verifiedLabel,
}: {
  menu: VenueMenu;
  verifiedLabel: string;
}) {
  const formatPrice = useFormatMenuPrice();
  const tMenu = useTranslations("menu");
  const tTag = useTranslations("menuTag");

  if (!menu.sections.length) return null;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        {verifiedLabel}: {menu.lastVerifiedAt}
        {menu.menuUrl ? (
          <>
            {" · "}
            <a
              href={menu.menuUrl}
              target="_blank"
              rel="noreferrer"
              className="text-foreground hover:underline"
            >
              {menu.menuUrl.replace(/^https?:\/\//, "").slice(0, 48)}
            </a>
          </>
        ) : null}
      </p>
      {menu.sections.map((sec) => (
        <div
          key={sec.id}
          className="rounded-2xl border border-border/60 bg-card/50 p-4"
        >
          <div className="flex flex-wrap items-baseline gap-2">
            <h4 className="font-display text-sm font-semibold text-foreground">
              {sec.title}
            </h4>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {sectionKindLabel(sec.kind, tMenu)}
            </span>
          </div>
          <ul className="mt-3 space-y-2">
            {sec.items.map((item) => {
              const itemKind =
                item.kind === "food" || item.kind === "drink"
                  ? item.kind
                  : (() => {
                      const inferred = inferMenuItemKind(item);
                      if (inferred !== "other") return inferred;
                      if (sec.kind === "food" || sec.kind === "drink") return sec.kind;
                      return inferred;
                    })();
              const displayTags = item.tags.filter((tag) =>
                menuTagMatchesItemKind(tag, itemKind),
              );
              const price = item.price ? formatPrice(item.price) : null;
              return (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{item.name}</p>
                    {item.description ? (
                      <p className="text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                    {displayTags.length > 0 ? (
                      <p className="mt-1 flex flex-wrap gap-1">
                        {displayTags.map((tag) => {
                          const key = menuTagMessageKey(tag);
                          return (
                            <span
                              key={tag}
                              className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
                            >
                              {key ? tTag(key) : tag}
                            </span>
                          );
                        })}
                      </p>
                    ) : null}
                  </div>
                  {price ? (
                    <span className="shrink-0 text-right text-sm font-semibold text-foreground">
                      {price.main}
                      {price.suffix ? (
                        <span className="block text-[10px] font-normal text-muted-foreground">
                          {price.suffix}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function VenueMenuPanel({ provider }: { provider: Provider }) {
  const t = useTranslations("menu");
  const formatPrice = useFormatMenuPrice();
  const menu = provider.menu;
  const offerings = provider.eventOfferings ?? [];

  if (!menu?.sections.length && offerings.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>;
  }

  return (
    <div className="space-y-6">
      {menu?.sections.length ? (
        <MenuBlock menu={menu} verifiedLabel={t("verified")} />
      ) : null}
      {offerings.map((ev: EventOffering) => (
        <div
          key={ev.id}
          className="rounded-2xl border border-border bg-muted p-4"
        >
          <h4 className="font-display text-sm font-semibold text-foreground">
            {ev.title}
          </h4>
          {ev.startsAt ? (
            <p className="text-xs text-muted-foreground">{ev.startsAt}</p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {ev.items.map((item) => {
              const price = item.price ? formatPrice(item.price) : null;
              return (
                <li
                  key={item.id}
                  className="flex justify-between gap-3 text-sm"
                >
                  <span className="text-foreground">{item.name}</span>
                  {price ? (
                    <span className="font-semibold text-foreground">
                      {price.main}
                      {price.suffix ?? ""}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
