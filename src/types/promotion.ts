export type PromotionType =
  | "featured_venue"
  | "featured_event"
  | "week_sponsor"
  | "vertical_sponsor";

export type PromotionDoc = {
  _id: string;
  type: PromotionType;
  targetId: string;
  startsAt: string;
  endsAt: string;
  label: string;
  priority: number;
  locales?: string[];
  internalNotes?: string;
  contractRef?: string;
  verticalSlug?: string;
};

export type ActivePromotion = Omit<PromotionDoc, "_id" | "internalNotes" | "contractRef"> & {
  id: string;
};
