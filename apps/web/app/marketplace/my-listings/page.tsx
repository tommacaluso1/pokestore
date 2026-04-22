import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyListingsWithOffers } from "@/lib/queries/marketplace";
import { respondToOfferAction, completeOfferAction, cancelListingAction } from "@/lib/actions/marketplace";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My listings — PokéStore" };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played", HEAVILY_PLAYED: "Heavily Played", DAMAGED: "Damaged",
};

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:    "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  PENDING:   "bg-amber-500/15 text-amber-300 border-amber-500/25",
  COMPLETED: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  CANCELLED: "bg-secondary text-muted-foreground border-border/40",
};

const OFFER_STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-secondary text-foreground/80 border-border/50",
  ACCEPTED:  "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  REJECTED:  "bg-destructive/15 text-destructive border-destructive/25",
  CANCELLED: "bg-secondary text-muted-foreground border-border/40",
  COMPLETED: "bg-violet-500/15 text-violet-300 border-violet-500/25",
};

const OFFER_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash", TRADE: "Trade", MIXED: "Cash + Cards",
};

export default async function MyListingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await getMyListingsWithOffers(session.user.id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">My listings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{listings.length} listing{listings.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/marketplace/new">
          <Button size="sm">+ New listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-28 border border-dashed border-border/40 rounded-2xl text-center gap-4">
          <p className="text-base font-semibold text-foreground/80">No listings yet</p>
          <p className="text-sm text-muted-foreground">List a card from your inventory to get started.</p>
          <Link href="/marketplace/new">
            <Button>Create your first listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => {
            const card      = listing.userCard.card;
            const condition = listing.userCard.condition;
            const pendingOffers = listing.offers.filter((o) => o.status === "PENDING").length;

            return (
              <div key={listing.id} className="bg-card border border-border/60 rounded-2xl overflow-hidden">
                {/* Listing header */}
                <div className="p-4 flex gap-4 items-start">
                  {card.imageSmall ? (
                    <div className="w-12 h-[68px] relative shrink-0 rounded-lg overflow-hidden bg-secondary/30">
                      <Image src={card.imageSmall} alt={card.name} fill className="object-contain p-1" unoptimized />
                    </div>
                  ) : (
                    <div className="w-12 h-[68px] shrink-0 rounded-lg bg-secondary/40 flex items-center justify-center text-muted-foreground/50 text-xs">?</div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/marketplace/${listing.id}`}
                          className="font-semibold text-sm hover:text-primary transition-colors truncate block"
                        >
                          {card.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {card.tcgSet.name}
                          <span className="mx-1.5 opacity-40">·</span>
                          {CONDITION_LABELS[condition] ?? condition}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {pendingOffers > 0 && (
                          <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">
                            {pendingOffers} new
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[listing.status] ?? "bg-secondary text-foreground border-border"}`}>
                          {listing.status}
                        </span>
                        {listing.status === "ACTIVE" && (
                          <form action={cancelListingAction.bind(null, listing.id)}>
                            <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">
                              Remove
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      {listing.askingPrice && (
                        <p className="text-base font-bold text-primary">
                          €{Number(listing.askingPrice).toFixed(2)}
                        </p>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {listing.offers.length} offer{listing.offers.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Offers */}
                {listing.offers.length > 0 && (
                  <div className="border-t border-border/40">
                    <div className="px-4 py-2 bg-secondary/20">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                        Offers
                      </p>
                    </div>
                    <div className="divide-y divide-border/30">
                      {listing.offers.map((offer) => (
                        <div key={offer.id} className="px-4 py-3 flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <p className="text-sm font-semibold text-foreground">
                                {offer.offerer.name ?? offer.offerer.email}
                              </p>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${OFFER_STATUS_STYLES[offer.status] ?? "bg-secondary text-foreground border-border"}`}>
                                {offer.status}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {OFFER_TYPE_LABELS[offer.offerType] ?? offer.offerType}
                                {offer.cashAmount ? ` · €${Number(offer.cashAmount).toFixed(2)}` : ""}
                              </span>
                            </div>
                            {offer.items.length > 0 && (
                              <p className="text-xs text-muted-foreground mb-1">
                                Cards: {offer.items.map((i) => `${i.userCard.card.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")}
                              </p>
                            )}
                            {offer.message && (
                              <p className="text-xs text-muted-foreground italic">"{offer.message}"</p>
                            )}
                          </div>

                          {offer.status === "PENDING" && (
                            <div className="flex gap-2 shrink-0">
                              <form action={respondToOfferAction.bind(null, offer.id, true)}>
                                <Button size="sm" type="submit" className="text-xs h-7 px-3">Accept</Button>
                              </form>
                              <form action={respondToOfferAction.bind(null, offer.id, false)}>
                                <Button size="sm" variant="outline" type="submit" className="text-xs h-7 px-3">Reject</Button>
                              </form>
                            </div>
                          )}

                          {offer.status === "ACCEPTED" && (
                            <form action={completeOfferAction.bind(null, offer.id)}>
                              <Button size="sm" variant="secondary" type="submit" className="text-xs h-7 px-3">
                                Mark complete
                              </Button>
                            </form>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {listing.offers.length === 0 && listing.status === "ACTIVE" && (
                  <div className="px-4 pb-3 border-t border-border/30 pt-3">
                    <p className="text-xs text-muted-foreground">No offers received yet.</p>
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
