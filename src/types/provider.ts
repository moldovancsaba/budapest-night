export type Category = "Events" | "Parties" | "Restaurants" | "Cafés";

/** Budapest districts / areas (stored as `borough` in Mongo for schema compatibility). */
export type Borough =
  | "Belváros"
  | "Terézváros"
  | "Erzsébetváros"
  | "Ferencváros"
  | "Buda"
  | "Óbuda"
  | "Újbuda";

/** Discover / Culture filter: one district or all of Budapest. */
export type BoroughChoice = Borough | "All";

export type AgeRange = "All ages" | "Family" | "18+" | "21+" | "Late night";

export type DayTimeTag =
  | "Weekday" | "Weekend" | "Morning" | "Afternoon" | "Evening" | "Late night";

export type FeaturedBadge =
  | "Featured" | "Popular" | "New" | "Staff Pick" | "Hidden Gem" | "Weekend Vibes";

export interface Provider {
  id: string;
  name: string;
  category: Category;
  borough: Borough;
  neighborhood: string;
  address: string;
  activityTypes: string[];
  ageRanges: AgeRange[];
  dayTimeTags: DayTimeTag[];
  pricePerClass: number;
  shortDescription: string;
  longDescription: string;
  rating: number;
  reviewCount: number;
  badges: FeaturedBadge[];
  image: string;
  email: string;
  website: string;
  phone: string;
  announcementTitle?: string;
  announcementDescription?: string;
  announcementBadge?: string;
  galleryImages?: string[];
  bookingEnabled?: boolean;
}
