-- AlterTable: add admin-moderation flag to Report (gates future riskScore logic)
ALTER TABLE "Report" ADD COLUMN "adminConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex: User riskScore (admin moderation sort)
CREATE INDEX "User_riskScore_idx" ON "User"("riskScore");

-- CreateIndex: CartItem
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex: Order
CREATE INDEX "Order_userId_status_createdAt_idx" ON "Order"("userId", "status", "createdAt");
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex: OrderItem
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex: UserCard
CREATE INDEX "UserCard_userId_cardId_idx" ON "UserCard"("userId", "cardId");

-- CreateIndex: Listing
CREATE INDEX "Listing_status_createdAt_idx" ON "Listing"("status", "createdAt");
CREATE INDEX "Listing_sellerId_status_idx" ON "Listing"("sellerId", "status");

-- CreateIndex: TradeOffer
CREATE INDEX "TradeOffer_status_createdAt_idx" ON "TradeOffer"("status", "createdAt");
CREATE INDEX "TradeOffer_offererId_status_idx" ON "TradeOffer"("offererId", "status");
CREATE INDEX "TradeOffer_listingId_status_idx" ON "TradeOffer"("listingId", "status");

-- CreateIndex: OfferItem
CREATE INDEX "OfferItem_offerId_idx" ON "OfferItem"("offerId");

-- CreateIndex: Report
CREATE INDEX "Report_reporterId_createdAt_idx" ON "Report"("reporterId", "createdAt");
CREATE INDEX "Report_adminConfirmed_createdAt_idx" ON "Report"("adminConfirmed", "createdAt");

-- DropForeignKey + re-add with CASCADE: CartItem.cartId -> Cart.id
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey + re-add with CASCADE: OfferItem.offerId -> TradeOffer.id
ALTER TABLE "OfferItem" DROP CONSTRAINT "OfferItem_offerId_fkey";
ALTER TABLE "OfferItem" ADD CONSTRAINT "OfferItem_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "TradeOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey + re-add with CASCADE: ProfileShowcase.profileId -> UserProfile.userId
ALTER TABLE "ProfileShowcase" DROP CONSTRAINT "ProfileShowcase_profileId_fkey";
ALTER TABLE "ProfileShowcase" ADD CONSTRAINT "ProfileShowcase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
