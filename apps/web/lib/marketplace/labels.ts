// Shared marketplace label + style maps. Used by my-listings, my-offers,
// MarketplaceGrid, and CreateListingForm. Keep in sync with Prisma enums
// (CardCondition, ListingStatus, ListingType, OfferStatus, OfferType).

export const CONDITION_LABELS: Record<string, string> = {
  MINT:              "Mint",
  NEAR_MINT:         "Near Mint",
  LIGHTLY_PLAYED:    "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played",
  HEAVILY_PLAYED:    "Heavily Played",
  DAMAGED:           "Damaged",
};

export const CONDITION_LABELS_SHORT: Record<string, string> = {
  MINT:              "Mint",
  NEAR_MINT:         "Near Mint",
  LIGHTLY_PLAYED:    "LP",
  MODERATELY_PLAYED: "MP",
  HEAVILY_PLAYED:    "HP",
  DAMAGED:           "Damaged",
};

export const LISTING_STATUS_STYLES: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  PENDING:   "bg-amber-500/15 text-amber-300 border-amber-500/25",
  COMPLETED: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  CANCELLED: "bg-secondary text-muted-foreground border-border/40",
};

export const OFFER_STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-500/15 text-amber-300 border-amber-500/25",
  ACCEPTED:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  REJECTED:  "bg-destructive/15 text-destructive border-destructive/25",
  CANCELLED: "bg-secondary text-muted-foreground border-border/40",
  COMPLETED: "bg-violet-500/15 text-violet-300 border-violet-500/25",
};

export const OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING:   "Pending",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

export const OFFER_TYPE_LABELS: Record<string, string> = {
  CASH:  "Cash",
  TRADE: "Trade",
  MIXED: "Cash + Cards",
};

export const LISTING_TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  TRADE:         { label: "Trade",         cls: "bg-violet-500/15 text-violet-300 border-violet-500/20" },
  SALE:          { label: "Sale",          cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
  TRADE_OR_SALE: { label: "Trade or Sale", cls: "bg-sky-500/15 text-sky-300 border-sky-500/20" },
};
