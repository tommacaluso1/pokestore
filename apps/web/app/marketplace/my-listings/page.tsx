import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getListings, getListingById } from "@/lib/queries/marketplace";
import { respondToOfferAction, completeOfferAction, cancelListingAction } from "@/lib/actions/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My listings — PokéStore" };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint", NEAR_MINT: "Near Mint", LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played", HEAVILY_PLAYED: "Heavily Played", DAMAGED: "Damaged",
};

const OFFER_STATUS_COLOR: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline", ACCEPTED: "default", REJECTED: "destructive",
  CANCELLED: "destructive", COMPLETED: "secondary",
};

export default async function MyListingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const listings = await getListings({ sellerId: session.user.id, status: undefined as any, limit: 50 });

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My listings</h1>
        <Link href="/marketplace/new">
          <Button size="sm">+ New listing</Button>
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p>No listings yet.</p>
          <Link href="/marketplace/new" className="mt-3 inline-block">
            <Button>Create your first listing</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

async function ListingRow({ listing }: { listing: Awaited<ReturnType<typeof getListings>>[number] }) {
  const full = await getListingById(listing.id);
  if (!full) return null;

  const card      = full.userCard.card;
  const condition = full.userCard.condition;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 flex gap-4 items-start">
        {card.imageSmall ? (
          <div className="w-14 h-14 relative shrink-0 bg-black/20 rounded-lg overflow-hidden">
            <Image src={card.imageSmall} alt={card.name} fill className="object-contain p-1" unoptimized />
          </div>
        ) : (
          <div className="w-14 h-14 shrink-0 bg-black/20 rounded-lg flex items-center justify-center text-muted-foreground text-xs">
            No img
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link href={`/marketplace/${listing.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                {card.name}
              </Link>
              <p className="text-xs text-muted-foreground">{card.tcgSet.name} · {CONDITION_LABELS[condition] ?? condition}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={listing.status === "ACTIVE" ? "default" : "secondary"} className="text-xs">
                {listing.status}
              </Badge>
              {listing.status === "ACTIVE" && (
                <form action={cancelListingAction.bind(null, listing.id)}>
                  <button className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remove</button>
                </form>
              )}
            </div>
          </div>

          {listing.askingPrice && (
            <p className="text-sm font-bold mt-1">€{Number(listing.askingPrice).toFixed(2)}</p>
          )}
        </div>
      </div>

      {full.offers.length > 0 && (
        <div className="border-t border-border divide-y divide-border">
          {full.offers.map((offer) => (
            <div key={offer.id} className="px-4 py-3 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium">{offer.offerer.name ?? offer.offerer.email}</p>
                  <Badge variant={OFFER_STATUS_COLOR[offer.status] ?? "outline"} className="text-xs">{offer.status}</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  {offer.cashAmount && <p>€{Number(offer.cashAmount).toFixed(2)} cash</p>}
                  {offer.items.length > 0 && (
                    <p>{offer.items.map((i) => `${i.userCard.card.name} ×${i.quantity}`).join(", ")}</p>
                  )}
                  {offer.message && <p className="italic">"{offer.message}"</p>}
                </div>
              </div>

              {offer.status === "PENDING" && (
                <div className="flex gap-2 shrink-0">
                  <form action={respondToOfferAction.bind(null, offer.id, true)}>
                    <Button size="sm" type="submit">Accept</Button>
                  </form>
                  <form action={respondToOfferAction.bind(null, offer.id, false)}>
                    <Button size="sm" variant="outline" type="submit">Reject</Button>
                  </form>
                </div>
              )}

              {offer.status === "ACCEPTED" && (
                <form action={completeOfferAction.bind(null, offer.id)}>
                  <Button size="sm" variant="secondary" type="submit">Mark complete</Button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {full.offers.length === 0 && listing.status === "ACTIVE" && (
        <p className="px-4 pb-3 text-xs text-muted-foreground">No offers yet.</p>
      )}
    </div>
  );
}
