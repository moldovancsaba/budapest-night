/**
 * Canonical icon surface — feature UI imports icons only from here or `GdsIcons`.
 * Tabler is confined to this module (GDS icon policy).
 */
import type { ComponentType } from "react";
import { GdsIcons } from "@doneisbetter/gds-core/client";
import type { Icon, IconProps } from "@tabler/icons-react";
import {
  IconAdjustmentsHorizontal,
  IconArrowLeft,
  IconArrowRight,
  IconBell,
  IconBlocks,
  IconBrandInstagram,
  IconBuilding,
  IconCalculator,
  IconCalendar,
  IconCalendarEvent,
  IconCalendarTime,
  IconChevronLeft,
  IconChevronRight,
  IconCoffee,
  IconCoins,
  IconCompass,
  IconConfetti,
  IconCopy,
  IconExternalLink,
  IconEye,
  IconGlass,
  IconHeart,
  IconHome,
  IconLanguage,
  IconLink,
  IconListCheck,
  IconLoader2,
  IconMail,
  IconMapPin,
  IconMenu2,
  IconMessageCircle,
  IconMinus,
  IconMoodKid,
  IconMusic,
  IconNavigation,
  IconPalette,
  IconPhone,
  IconPlus,
  IconRefresh,
  IconRotate,
  IconSearch,
  IconShare,
  IconSparkles,
  IconSpeakerphone,
  IconStar,
  IconTicket,
  IconToolsKitchen2,
  IconTrash,
  IconUserCircle,
  IconUsers,
  IconWorld,
  IconX,
  IconShieldCheck,
} from "@tabler/icons-react";

export { GdsIcons };

export type GdsIconComponent = ComponentType<IconProps>;

const icon = (glyph: Icon): GdsIconComponent => glyph as GdsIconComponent;

export const CalendarDays = icon(IconCalendar);
export const CalendarRange = icon(IconCalendarEvent);
export const PartyPopper = icon(IconConfetti);
export const UtensilsCrossed = icon(IconToolsKitchen2);
export const Coffee = icon(IconCoffee);
export const Palette = icon(IconPalette);
export const Heart = icon(IconHeart);
export const Calculator = icon(IconCalculator);
export const Users = icon(IconUsers);
export const X = icon(IconX);
export const Home = icon(IconHome);
export const UserCircle = icon(IconUserCircle);
export const Wine = icon(IconGlass);
export const Building2 = icon(IconBuilding);
export const MenuIcon = icon(IconMenu2);
export const Menu = icon(IconMenu2);
export const Bell = icon(IconBell);
export const MapPin = icon(IconMapPin);
export const Sparkles = icon(IconSparkles);
export const Star = icon(IconStar);
export const ArrowRight = icon(IconArrowRight);
export const ArrowLeft = icon(IconArrowLeft);
export const Calendar = icon(IconCalendar);
export const Megaphone = icon(IconSpeakerphone);
export const ChevronLeft = icon(IconChevronLeft);
export const ChevronRight = icon(IconChevronRight);
export const Mail = icon(IconMail);
export const MessageCircle = icon(IconMessageCircle);
export const Link2 = icon(IconLink);
export const ExternalLink = icon(IconExternalLink);
export const Ticket = icon(IconTicket);
export const Navigation = icon(IconNavigation);
export const RefreshCw = icon(IconRefresh);
export const Search = icon(IconSearch);
export const SlidersHorizontal = icon(IconAdjustmentsHorizontal);
export const Trash2 = icon(IconTrash);
export const Plus = icon(IconPlus);
export const Minus = icon(IconMinus);
export const Share2 = icon(IconShare);
export const Instagram = icon(IconBrandInstagram);
export const CalendarClock = icon(IconCalendarTime);
export const Compass = icon(IconCompass);
export const ListChecks = icon(IconListCheck);
export const ShieldCheck = icon(IconShieldCheck);
export const Coins = icon(IconCoins);
export const Languages = icon(IconLanguage);
export const Loader2 = icon(IconLoader2);
export const Globe = icon(IconWorld);
export const Phone = icon(IconPhone);
export const Eye = icon(IconEye);
export const HandCoins = icon(IconCoins);
export const RotateCcw = icon(IconRotate);
export const Copy = icon(IconCopy);
export const Martini = icon(IconGlass);
export const Music2 = icon(IconMusic);
export const Baby = icon(IconMoodKid);
export const Blocks = icon(IconBlocks);
