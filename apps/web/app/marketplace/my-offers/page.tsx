import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOffersByUser } from "@/lib/queries/marketplace";
import { cancelOfferAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My offers — PokéStore" };

const STATUS_STYLES: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: "Pending",   cls: "bg-amber-500/15 text-amber-300 border-amber-500/25" },
  ACCEPTED:  { label: "Accepted",  cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" },
  REJECTED:  { label: "Rejected",  cls: "bg-destructive/15 text-destructive border-destructive/25" },
  CANCELLED: { label: "Cancelled", cls: "bg-secondary text-muted-foreground border-border/40" },
  COMPLETED: { label: "Completed", cls: "bg-violet-500/15 text-violet-300 border-violet-500/25" },
};

const OFFER_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash offer", TRADE: "Card trade", MIXED: "Cash + cards",
};

export default async function MyOffersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const offers = await getOffersByUser(session.user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My offers</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{offers.length} offer{offers.length !== 1 ? "s" : ""} sent</p>
        </div>
        <Link href="/marketplace">
          <Button variant="outline" size="sm">Browse marketplace</Button>
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 border border-dashed border-border/40 rounded-2xl text-center gap-4">
          <p className="text-base font-semibold text-foreground/80">No offers sent yet</p>
          <p className="text-sm text-muted-foreground">Find a listing you like and make an offer.</p>
          <Link href="/marketplace">
            <Button>Browse listings</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const listingCard = offer.listing.userCard.card;
            const statusInfo  = STATUS_STYLES[offer.status] ?? { label: offer.status, cls: "bg-secondary text-foreground border-border" };

            return (
              <div key={offer.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 flex gap-4 items-start">
                  {listingCard.imageSmall ? (
                    <div className="w-10 h-14 relative shrink-0 rounded-lg overflow-hidden bg-secondary/30">
                      <Image src={listingCard.imageSmall} alt={listingCard.name} fill className="object-contain" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-14 shrink-0 rounded-lg bg-secondary/40" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/marketplace/${offer.listingId}`}
                          className="font-semibold text-sm hover:text-primary transition-colors block truncate"
                        >
                          {listingCard.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {listingCard.tcgSet.name}
                          <span className="mx-1.5 opacity-40">·</span>
                          Seller: {offer.listing.seller.name ?? offer.listing.seller.email}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Offer summary */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-foreground/80 bg-secondary/60 border border-border/40 rounded-lg px-2 py-0.5">
                        {OFFER_TYPE_LABELS[offer.offerType] ?? offer.offerType}
                      </span>
                      {offer.cashAmount && (
                        <span className="text-xs font-bold text-primary">
                          €{Number(offer.cashAmount).toFixed(2)}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(offer.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offered cards */}
                {offer.items.length > 0 && (
                  <div className="px-4 pb-3 -mt-1 flex flex-wrap gap-2">
                    {offer.items.map((item) => (
                      <span key={item.id} className="inline-flex items-center gap-1.5 text-xs bg-secondary/50 text-foreground/80 border border-border/40 rounded-lg px-2.5 py-1">
                        {item.userCard.card.imageSmall && (
                          <img src={item.userCard.card.imageSmall} alt="" className="w-4 h-5 object-contain" />
                        )}
                        {item.userCard.card.name}
                        {item.quantity > 1 && <span className="text-muted-foreground">×{item.quantity}</span>}
                      </span>
                    ))}
                  </div>
                )}

                {/* Message */}
                {offer.message && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-muted-foreground italic bg-secondary/30 rounded-lg px-3 py-2 border border-border/30">
                      "{offer.message}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                {offer.status === "PENDING" && (
                  <div className="px-4 pb-4 pt-0">
                    <form action={cancelOfferAction.bind(null, offer.id)}>
                      <Button size="sm" variant="outline" type="submit"
                        className="text-xs h-7 px-3 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60 hover:bg-destructive/5">
                        Cancel offer
                      </Button>
                    </form>
                  </div>
                )}

                {offer.status === "ACCEPTED" && (
                  <div className="px-4 pb-4">
                    <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                      Offer accepted — contact the seller to arrange the exchange.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
