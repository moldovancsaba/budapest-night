import type { AppLocale } from "@/i18n/config";

export type ProgramWeekLocaleBlock = {
  headline: string;
  intro?: string;
};

export type ProgramWeekDoc = {
  _id: string;
  weekId: string;
  weekStartsAt: string;
  weekEndsAt: string;
  published: boolean;
  locales: Partial<Record<AppLocale, ProgramWeekLocaleBlock>> & {
    hu: ProgramWeekLocaleBlock;
  };
  featuredEventIds: string[];
  featuredProviderIds: string[];
  sponsorName?: string;
  sponsorUrl?: string;
  editorNotes?: string;
  updatedAt: string;
};

export type PublicProgramWeek = {
  weekId: string;
  weekStartsAt: string;
  weekEndsAt: string;
  headline: string;
  intro?: string;
  featuredEventIds: string[];
  featuredProviderIds: string[];
  sponsorName?: string;
  sponsorUrl?: string;
};
