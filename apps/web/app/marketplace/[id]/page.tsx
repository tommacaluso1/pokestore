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

type Props = { params: Promise<{ id: string }> };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Moderately Played", HEAVILY_PLAYED: "Heavily Played", DAMAGED: "Damaged",
};

const TYPE_LABELS: Record<string, string> = {
  TRADE: "Trade only", SALE: "For sale", TRADE_OR_SALE: "Trade or Sale",
};

const OFFER_STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", ACCEPTED: "default", REJECTED: "destructive",
  CANCELLED: "destructive", COMPLETED: "secondary",
};

const OFFER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", ACCEPTED: "Accepted", REJECTED: "Rejected",
  CANCELLED: "Cancelled", COMPLETED: "Completed",
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
        <Link href="/marketplace" className="hover:text-foreground transition-colors">Marketplace</Link>
        <ChevronRight className="size-3" />
        <span className="text-foreground truncate">{card.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 mb-10">
        {/* Card image — portrait */}
        <div className="w-full md:w-56 aspect-[2/3] relative bg-card border border-border rounded-xl overflow-hidden">
          {card.imageSmall ? (
            <Image
              src={card.imageLarge ?? card.imageSmall}
              alt={card.name}
              fill
              className="object-contain p-4"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Title */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                  {card.tcgSet.name}
                </p>
                <h1 className="text-2xl font-bold leading-tight">{card.name}</h1>
              </div>
              {listing.status !== "ACTIVE" && (
                <Badge variant="secondary" className="shrink-0 mt-1">{listing.status}</Badge>
              )}
            </div>
          </div>

          {/* Key attributes — 2 max visible */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{CONDITION_LABELS[condition] ?? condition}</Badge>
            <Badge variant="secondary">{TYPE_LABELS[listing.listingType] ?? listing.listingType}</Badge>
          </div>

          {/* Supporting metadata */}
          <div className="text-xs text-muted-foreground space-y-1">
            {card.rarity && <p>Rarity: <span className="text-foreground">{card.rarity}</span></p>}
            {listing.quantity > 1 && <p>Quantity available: <span className="text-foreground">{listing.quantity}</span></p>}
          </div>

          {/* Price */}
          {listing.askingPrice && (
            <div className="py-4 border-t border-b border-border">
              <p className="text-xs text-muted-foreground mb-1">Asking price</p>
              <p className="text-4xl font-bold text-primary">€{Number(listing.askingPrice).toFixed(2)}</p>
            </div>
          )}

          {listing.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
          )}

          {/* Seller */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Listed by</p>
            <p className="text-sm font-semibold">{listing.seller.name ?? listing.seller.email}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(listing.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

          {/* Actions */}
          {isSeller && (
            <Link href="/marketplace/my-listings">
              <Button variant="outline" className="w-full">Manage this listing</Button>
            </Link>
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
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-5">Make an offer</h2>
          <OfferForm listingId={listing.id} inventory={inventory} />
        </div>
      )}

      {/* Incoming offers — seller only */}
      {isSeller && listing.offers.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Offers ({listing.offers.length})</h2>
          <div className="space-y-3">
            {listing.offers.map((offer) => (
              <div key={offer.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-semibold">{offer.offerer.name ?? offer.offerer.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {OFFER_TYPE_LABELS[offer.offerType] ?? offer.offerType}
                      {offer.cashAmount && ` · €${Number(offer.cashAmount).toFixed(2)}`}
                    </p>
                  </div>
                  <Badge variant={OFFER_STATUS_COLOR[offer.status] ?? "outline"} className="text-xs shrink-0">
                    {OFFER_STATUS_LABELS[offer.status] ?? offer.status}
                  </Badge>
                </div>
                {offer.items.length > 0 && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {offer.items.map((i) => `${i.userCard.card.name} ×${i.quantity}`).join(", ")}
                  </p>
                )}
                {offer.message && (
                  <p className="text-xs text-muted-foreground italic border-t border-border pt-2 mt-2">
                    "{offer.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
