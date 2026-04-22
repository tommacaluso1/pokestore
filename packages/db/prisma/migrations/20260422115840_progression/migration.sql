-- CreateEnum
CREATE TYPE "XPReason" AS ENUM ('LISTING_CREATED', 'OFFER_SENT', 'TRADE_COMPLETED', 'SALE_COMPLETED', 'CARD_ACQUIRED', 'ORDER_PLACED', 'BONUS_FIRST_LISTING', 'BONUS_FIRST_TRADE', 'BONUS_FIRST_SALE');

-- CreateEnum
CREATE TYPE "BadgeTier" AS ENUM ('COMMON', 'RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('TRADING', 'SELLING', 'COLLECTING', 'LISTING', 'LEVEL', 'SPECIAL');

-- CreateTable
CREATE TABLE "UserXP" (
    "userId" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserXP_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "XPEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "XPReason" NOT NULL,
    "entityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tier" "BadgeTier" NOT NULL,
    "category" "BadgeCategory" NOT NULL,
    "iconKey" TEXT NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "userId" TEXT NOT NULL,
    "avatarId" TEXT NOT NULL DEFAULT 'gengar',
    "themeId" TEXT NOT NULL DEFAULT 'purple',
    "bio" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "ProfileShowcase" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userBadgeId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProfileShowcase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileFeaturedCard" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "userCardId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProfileFeaturedCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XPEvent_userId_idx" ON "XPEvent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XPEvent_userId_reason_entityId_key" ON "XPEvent"("userId", "reason", "entityId");

-- CreateIndex
CREATE INDEX "UserBadge_userId_idx" ON "UserBadge"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON "UserBadge"("userId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileShowcase_profileId_position_key" ON "ProfileShowcase"("profileId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileShowcase_profileId_userBadgeId_key" ON "ProfileShowcase"("profileId", "userBadgeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileFeaturedCard_profileId_position_key" ON "ProfileFeaturedCard"("profileId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileFeaturedCard_profileId_userCardId_key" ON "ProfileFeaturedCard"("profileId", "userCardId");

-- AddForeignKey
ALTER TABLE "UserXP" ADD CONSTRAINT "UserXP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XPEvent" ADD CONSTRAINT "XPEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileShowcase" ADD CONSTRAINT "ProfileShowcase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileShowcase" ADD CONSTRAINT "ProfileShowcase_userBadgeId_fkey" FOREIGN KEY ("userBadgeId") REFERENCES "UserBadge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileFeaturedCard" ADD CONSTRAINT "ProfileFeaturedCard_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileFeaturedCard" ADD CONSTRAINT "ProfileFeaturedCard_userCardId_fkey" FOREIGN KEY ("userCardId") REFERENCES "UserCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
