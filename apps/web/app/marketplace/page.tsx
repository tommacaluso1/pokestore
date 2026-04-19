import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { getListings } from "@/lib/queries/marketplace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { ListingType, CardCondition } from "@repo/db";

export const metadata = { title: "Marketplace — PokéStore" };

const CONDITION_LABELS: Record<string, string> = {
  MINT: "Mint",
  NEAR_MINT: "Near Mint",
  LIGHTLY_PLAYED: "Lightly Played",
  MODERATELY_PLAYED: "Mod. Played",
  HEAVILY_PLAYED: "Heavily Played",
  DAMAGED: "Damaged",
};

const TYPE_LABELS: Record<string, string> = {
  TRADE: "Trade",
  SALE: "Sale",
  TRADE_OR_SALE: "Trade or Sale",
};

const TYPE_COLOR: Record<string, "default" | "secondary" | "outline"> = {
  TRADE: "secondary",
  SALE: "default",
  TRADE_OR_SALE: "outline",
};

type Props = { searchParams: Promise<{ type?: string; condition?: string }> };

export default async function MarketplacePage({ searchParams }: Props) {
  const { type, condition } = await searchParams;
  const session = await auth();

  const listings = await getListings({
    type: type as ListingType | undefined,
    condition: condition as CardCondition | undefined,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground text-sm mt-1">Trade and sell your Pokémon cards</p>
        </div>
        {session?.user && (
          <div className="flex gap-2">
            <Link href="/marketplace/my-offers">
              <Button variant="outline" size="sm">My offers</Button>
            </Link>
            <Link href="/marketplace/my-listings">
              <Button variant="outline" size="sm">My listings</Button>
            </Link>
            <Link href="/marketplace/new">
              <Button size="sm">+ New listing</Button>
            </Link>
          </div>
        )}
      </div>

      {/* Filters */}
      <form method="get" className="flex gap-3 mb-8">
        <Select name="type" defaultValue={type ?? ""} className="w-44">
          <option value="">All types</option>
          <option value="SALE">Sale</option>
          <option value="TRADE">Trade</option>
          <option value="TRADE_OR_SALE">Trade or Sale</option>
        </Select>
        <Select name="condition" defaultValue={condition ?? ""} className="w-48">
          <option value="">All conditions</option>
          <option value="MINT">Mint</option>
          <option value="NEAR_MINT">Near Mint</option>
          <option value="LIGHTLY_PLAYED">Lightly Played</option>
          <option value="MODERATELY_PLAYED">Moderately Played</option>
          <option value="HEAVILY_PLAYED">Heavily Played</option>
          <option value="DAMAGED">Damaged</option>
        </Select>
        <Button type="submit" variant="outline" size="sm">Filter</Button>
        {(type || condition) && (
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">Clear</Button>
          </Link>
        )}
      </form>

      {listings.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">No listings found</p>
          <p className="text-sm mt-1">Be the first to list a card.</p>
          {session?.user && (
            <Link href="/marketplace/new" className="mt-4 inline-block">
              <Button>Create a listing</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/marketplace/${listing.id}`}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors flex flex-col gap-3"
            >
              {listing.imageUrl ? (
                <div className="aspect-video relative rounded-lg overflow-hidden bg-black/20">
                  <Image src={listing.imageUrl} alt={listing.cardName} fill className="object-contain p-2" />
                </div>
              ) : (
                <div className="aspect-video rounded-lg bg-black/20 flex items-center justify-center text-muted-foreground text-xs">
                  No image
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight truncate">{listing.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {listing.cardName}{listing.setName ? ` · ${listing.setName}` : ""}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant={TYPE_COLOR[listing.listingType] ?? "outline"} className="text-xs">
                    {TYPE_LABELS[listing.listingType] ?? listing.listingType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {CONDITION_LABELS[listing.condition] ?? listing.condition}
                  </Badge>
                </div>
                {listing.askingPrice && (
                  <span className="font-bold text-sm">€{Number(listing.askingPrice).toFixed(2)}</span>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                {listing.seller.name ?? listing.seller.email} ·{" "}
                {new Date(listing.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
