import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { auth } from "@/auth";
import { getListingById } from "@/lib/queries/marketplace";
import { getUserInventory } from "@/lib/queries/inventory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OfferForm } from "./OfferForm";
import { ReportUserButton } from "@/components/ReportUserButton";

type Props = { params: Promise<{ id: string }> };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Moderately Played", HEAVILY_PLAYED: "Heavily Played", DAMAGED: "Damaged",
};

const TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  TRADE:         { label: "Trade only",   cls: "bg-violet-500/15 text-violet-300 border border-violet-500/25" },
  SALE:          { label: "For sale",     cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" },
  TRADE_OR_SALE: { label: "Trade or Sale",cls: "bg-sky-500/15 text-sky-300 border border-sky-500/25" },
};

const OFFER_STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pending",   cls: "bg-secondary text-foreground/80 border-border/60" },
  ACCEPTED:  { label: "Accepted",  cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  REJECTED:  { label: "Rejected",  cls: "bg-destructive/15 text-destructive border-destructive/25" },
  CANCELLED: { label: "Cancelled", cls: "bg-destructive/15 text-destructive border-destructive/25" },
  COMPLETED: { label: "Completed", cls: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
};

const OFFER_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash offer", TRADE: "Card trade", MIXED: "Cash + cards",
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};
  return { title: `${listing.userCard.card.name} — PokéStore Marketplace` };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), auth()]);

  if (!listing || listing.status === "CANCELLED") notFound();

  const card      = listing.userCard.card;
  const condition = listing.userCard.condition;
  const userId    = session?.user?.id;
  const isSeller  = userId === listing.sellerId;
  const isActive  = listing.status === "ACTIVE";
  const canOffer  = !!userId && !isSeller && isActive;

  const inventory = canOffer ? await getUserInventory(userId as string) : [];

  const typeInfo = TYPE_STYLES[listing.listingType] ?? { label: listing.listingType, cls: "bg-secondary text-foreground border-border" };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground/80 truncate">{card.name}</span>
      </nav>

      {/* Card + details */}
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 mb-8">
        {/* Card image */}
        <div className="w-full md:w-52 aspect-[2/3] relative bg-gradient-to-b from-secondary/20 to-secondary/40 rounded-2xl overflow-hidden border border-border/60 shadow-[0_8px_32px_oklch(0.54_0.24_285/0.08)]">
          {card.imageSmall ? (
            <Image
              src={card.imageLarge ?? card.imageSmall}
              alt={card.name}
              fill
              className="object-contain p-4"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/50 text-sm">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Set + title */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {card.tcgSet.name}
            </p>
            <h1 className="text-3xl font-bold leading-tight tracking-tight">{card.name}</h1>
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full border bg-secondary/60 text-foreground/90 border-border/60">
              {CONDITION_LABELS[condition] ?? condition}
              {listing.userCard.foil && <span className="ml-1.5 text-amber-400">✦ Foil</span>}
            </span>
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full ${typeInfo.cls}`}>
              {typeInfo.label}
            </span>
            {listing.status !== "ACTIVE" && (
              <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-secondary text-foreground/60 border border-border/40">
                {listing.status}
              </span>
            )}
          </div>

          {/* Rarity + qty */}
          <div className="text-sm text-muted-foreground space-y-0.5">
            {card.rarity && (
              <p>Rarity: <span className="text-foreground font-medium">{card.rarity}</span></p>
            )}
            {listing.quantity > 1 && (
              <p>Quantity: <span className="text-foreground font-medium">{listing.quantity}</span></p>
            )}
          </div>

          {/* Price */}
          {listing.askingPrice && (
            <div className="py-4 border-t border-b border-border/40">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Asking price
              </p>
              <p className="text-4xl font-bold text-primary tracking-tight">
                €{Number(listing.askingPrice).toFixed(2)}
              </p>
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed bg-secondary/30 rounded-xl px-4 py-3 border border-border/30">
              {listing.description}
            </p>
          )}

          {/* Seller info */}
          <Link
            href={`/profile/${listing.seller.id}`}
            className="flex items-center gap-3 pt-2 border-t border-border/30 group hover:opacity-90 transition-opacity"
          >
            <div className="size-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {(listing.seller.name ?? listing.seller.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {listing.seller.name ?? listing.seller.email}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {listing.sellerRating.average !== null ? (
                  <span className="text-xs text-amber-400 font-medium">
                    {"★".repeat(Math.round(listing.sellerRating.average))}{"☆".repeat(5 - Math.round(listing.sellerRating.average))}
                    {" "}{listing.sellerRating.average.toFixed(1)}
                    <span className="text-muted-foreground ml-1">({listing.sellerRating.count})</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No reviews yet</span>
                )}
              </div>
            </div>
          </Link>

          {/* Actions */}
          {isSeller && (
            <Link href="/marketplace/my-listings">
              <Button variant="outline" className="w-full">Manage this listing</Button>
            </Link>
          )}
          {!isSeller && userId && (
            <div className="pt-1">
              <ReportUserButton reportedId={listing.seller.id} />
            </div>
          )}
          {!userId && isActive && (
            <Link href="/login">
              <Button className="w-full">Sign in to make an offer</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Offer form */}
      {canOffer && (
        <div className="bg-card border border-border/60 rounded-2xl p-6 mb-8 shadow-[0_4px_24px_oklch(0.54_0.24_285/0.06)]">
          <h2 className="text-xl font-bold mb-5">Make an offer</h2>
          <OfferForm listingId={listing.id} inventory={inventory} />
        </div>
      )}

      {/* Incoming offers — seller only */}
      {isSeller && listing.offers.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">
            Offers
            <span className="ml-2 text-sm font-semibold text-muted-foreground">
              ({listing.offers.length})
            </span>
          </h2>
          <div className="space-y-3">
            {listing.offers.map((offer) => {
              const statusInfo = OFFER_STATUS_STYLES[offer.status] ?? { label: offer.status, cls: "bg-secondary text-foreground border-border" };
              return (
                <div key={offer.id} className="bg-card border border-border/60 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground/80 shrink-0">
                        {(offer.offerer.name ?? offer.offerer.email ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {offer.offerer.name ?? offer.offerer.email}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {OFFER_TYPE_LABELS[offer.offerType] ?? offer.offerType}
                          {offer.cashAmount ? ` · €${Number(offer.cashAmount).toFixed(2)}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusInfo.cls}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {offer.items.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {offer.items.map((item) => (
                        <span key={item.id} className="inline-flex items-center text-xs bg-secondary/60 text-foreground/80 border border-border/40 rounded-lg px-2.5 py-1 gap-1.5">
                          {item.userCard.card.imageSmall && (
                            <span className="relative size-4 shrink-0 inline-block">
                              <img
                                src={item.userCard.card.imageSmall}
                                alt=""
                                className="w-4 h-5 object-contain"
                              />
                            </span>
                          )}
                          {item.userCard.card.name}
                          {item.quantity > 1 && <span className="text-muted-foreground">×{item.quantity}</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {offer.message && (
                    <p className="text-xs text-muted-foreground italic bg-secondary/30 rounded-lg px-3 py-2 border border-border/30">
                      "{offer.message}"
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
