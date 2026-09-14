import {
  Bike,
  BookOpen,
  Briefcase,
  Car,
  Clapperboard,
  FileDown,
  MonitorSmartphone,
  Package,
  PiggyBank,
  PlaySquare,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  SprayCan,
  Sparkle,
  Sprout,
  Store,
  WashingMachine,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const BY_SLUG: Record<string, LucideIcon> = {
  "virtual-assistant": MonitorSmartphone,
  "online-esl": BookOpen,
  "freelance-writing": FileDown,
  "tiktok-creator": Clapperboard,
  "youtube-channel": PlaySquare,
  "shopee-reseller": ShoppingCart,
  "fb-marketplace-buy-sell": ShoppingBag,
  "ukay-online": Shirt,
  "digital-products": FileDown,
  "home-baking": Store,
  "frozen-goods-reselling": Package,
  "milk-tea-cart": Store,
  "sari-sari-store": Store,
  "ride-hailing-rider": Bike,
  "food-delivery-rider": Bike,
  "lalamove-driver": Car,
  "errand-service": Package,
  "home-tutoring": BookOpen,
  "home-salon-nails": Sparkle,
  "aircon-cleaning": SprayCan,
  "phone-repair": Wrench,
  "laundry-service": WashingMachine,
  "backyard-poultry": Sprout,
  "mushroom-growing": Sprout,
  "ornamental-plants": Sprout,
  "affiliate-marketing": PiggyBank,
};

const BY_CATEGORY: Record<string, LucideIcon> = {
  "Online / Remote": MonitorSmartphone,
  "Online Selling": ShoppingBag,
  "Food & Local Negosyo": Store,
  "Gig Economy": Bike,
  "Local Services": Wrench,
  "Agri & Provincial": Sprout,
  "Content & Creative": Clapperboard,
  Finance: PiggyBank,
};

export function hustleIcon(slug: string, category: string): LucideIcon {
  return BY_SLUG[slug] ?? BY_CATEGORY[category] ?? Briefcase;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  "Online / Remote": { bg: "bg-sky-50", text: "text-sky-600" },
  "Online Selling": { bg: "bg-violet-50", text: "text-violet-600" },
  "Food & Local Negosyo": { bg: "bg-orange-50", text: "text-orange-600" },
  "Gig Economy": { bg: "bg-cyan-50", text: "text-cyan-600" },
  "Local Services": { bg: "bg-teal-50", text: "text-teal-600" },
  "Agri & Provincial": { bg: "bg-lime-50", text: "text-lime-700" },
  "Content & Creative": { bg: "bg-pink-50", text: "text-pink-600" },
  Finance: { bg: "bg-amber-50", text: "text-amber-600" },
};

export function categoryStyle(category: string) {
  return CATEGORY_STYLES[category] ?? { bg: "bg-ink-100", text: "text-ink-600" };
}
