import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { getListingById } from "@/lib/queries/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OfferForm } from "./OfferForm";

type Props = { params: Promise<{ id: string }> };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint",
  NEAR_MINT: "Near Mint",
  LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Moderately Played",
  HEAVILY_PLAYED: "Heavily Played",
  DAMAGED: "Damaged",
};

const TYPE_LABELS: Record<string, string> = {
  TRADE: "Trade",
  SALE: "Sale",
  TRADE_OR_SALE: "Trade or Sale",
};

const OFFER_STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  ACCEPTED: "default",
  REJECTED: "destructive",
  CANCELLED: "destructive",
  COMPLETED: "secondary",
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) return {};
  return { title: `${listing.title} — PokéStore Marketplace` };
}

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListingById(id), auth()]);

  if (!listing || listing.status === "CANCELLED") notFound();

  const userId = session?.user?.id;
  const isSeller = userId === listing.sellerId;
  const isActive = listing.status === "ACTIVE";
  const canOffer = !!userId && !isSeller && isActive;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/marketplace" className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block">
        ← Marketplace
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Image */}
        <div className="aspect-square relative bg-card border border-border rounded-xl overflow-hidden">
          {listing.imageUrl ? (
            <Image src={listing.imageUrl} alt={listing.cardName} fill className="object-contain p-6" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              No image
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-2xl font-bold leading-tight">{listing.title}</h1>
              {listing.status !== "ACTIVE" && (
                <Badge variant="secondary" className="shrink-0 mt-1">{listing.status}</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {listing.cardName}{listing.setName ? ` · ${listing.setName}` : ""}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{CONDITION_LABELS[listing.condition] ?? listing.condition}</Badge>
            <Badge variant="secondary">{TYPE_LABELS[listing.listingType] ?? listing.listingType}</Badge>
          </div>

          {listing.askingPrice && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Asking price</p>
              <p className="text-3xl font-bold mt-0.5">€{Number(listing.askingPrice).toFixed(2)}</p>
            </div>
          )}

          {listing.description && (
            <p className="text-sm text-muted-foreground">{listing.description}</p>
          )}

          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">Listed by</p>
            <p className="text-sm font-medium mt-0.5">
              {listing.seller.name ?? listing.seller.email}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(listing.createdAt).toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

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
        <div className="bg-card border border-border rounded-xl p-5 mb-8">
          <h2 className="text-lg font-semibold mb-4">Make an offer</h2>
          <OfferForm listingId={listing.id} />
        </div>
      )}

      {/* Offers visible to seller */}
      {isSeller && listing.offers.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Offers ({listing.offers.length})</h2>
          {listing.offers.map((offer) => (
            <div key={offer.id} className="bg-card border border-border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{offer.offerer.name ?? offer.offerer.email}</p>
                <Badge variant={OFFER_STATUS_COLOR[offer.status] ?? "outline"}>{offer.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-0.5">
                <p>Type: {offer.offerType}</p>
                {offer.cashAmount && <p>Cash: €{Number(offer.cashAmount).toFixed(2)}</p>}
                {offer.offeredCards && <p>Cards: {offer.offeredCards}</p>}
                {offer.message && <p>Message: {offer.message}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
