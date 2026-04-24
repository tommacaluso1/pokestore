-- Cap lengths on user-generated text to prevent storage-abuse DoS.
-- Existing rows that exceed caps will fail — these columns are all short
-- in practice (app-layer slice on bio, short fields elsewhere).

ALTER TABLE "User"
  ALTER COLUMN "email" TYPE VARCHAR(254),
  ALTER COLUMN "name"  TYPE VARCHAR(50);

ALTER TABLE "Listing"
  ALTER COLUMN "description" TYPE VARCHAR(2000);

ALTER TABLE "TradeOffer"
  ALTER COLUMN "message" TYPE VARCHAR(1000);

ALTER TABLE "UserProfile"
  ALTER COLUMN "avatarId" TYPE VARCHAR(32),
  ALTER COLUMN "themeId"  TYPE VARCHAR(32),
  ALTER COLUMN "bio"      TYPE VARCHAR(160);

ALTER TABLE "Report"
  ALTER COLUMN "description" TYPE VARCHAR(1000);

ALTER TABLE "SellerReview"
  ALTER COLUMN "comment" TYPE VARCHAR(1000);
