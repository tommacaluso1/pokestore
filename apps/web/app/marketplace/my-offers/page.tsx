import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOffersByUser } from "@/lib/queries/marketplace";
import { cancelOfferAction } from "@/lib/actions/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My offers — PokéStore" };

const STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", ACCEPTED: "default", REJECTED: "destructive",
  CANCELLED: "destructive", COMPLETED: "secondary",
};

const OFFER_TYPE_LABELS: Record<string, string> = {
  CASH: "Cash", TRADE: "Trade", MIXED: "Cash + Cards",
};

export default async function MyOffersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const offers = await getOffersByUser(session.user.id);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My offers</h1>
        <Link href="/marketplace">
          <Button variant="outline" size="sm">Browse marketplace</Button>
        </Link>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p>No offers sent yet.</p>
          <Link href="/marketplace" className="mt-3 inline-block">
            <Button>Browse listings</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const listingCard = offer.listing.userCard.card;
            return (
              <div key={offer.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/marketplace/${offer.listingId}`}
                      className="font-semibold text-sm hover:text-primary transition-colors"
                    >
                      {listingCard.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {listingCard.tcgSet.name} · Seller: {offer.listing.seller.name ?? offer.listing.seller.email}
                    </p>
                  </div>
                  <Badge variant={STATUS_COLOR[offer.status] ?? "outline"} className="shrink-0 text-xs">
                    {offer.status}
                  </Badge>
                </div>

                <div className="flex gap-1.5 flex-wrap mb-3">
                  <Badge variant="secondary" className="text-xs">{OFFER_TYPE_LABELS[offer.offerType] ?? offer.offerType}</Badge>
                  {offer.cashAmount && (
                    <span className="text-xs font-semibold">€{Number(offer.cashAmount).toFixed(2)}</span>
                  )}
                </div>

                <div className="text-xs text-muted-foreground space-y-0.5">
                  {offer.items.length > 0 && (
                    <p>Cards offered: {offer.items.map((i) => `${i.userCard.card.name} ×${i.quantity}`).join(", ")}</p>
                  )}
                  {offer.message && <p className="italic">"{offer.message}"</p>}
                  <p>
                    {new Date(offer.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>

                {offer.status === "PENDING" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <form action={cancelOfferAction.bind(null, offer.id)}>
                      <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" type="submit">
                        Cancel offer
                      </Button>
                    </form>
                  </div>
                )}

                {offer.status === "ACCEPTED" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-primary font-medium">
                      Offer accepted — contact the seller to arrange exchange.
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
