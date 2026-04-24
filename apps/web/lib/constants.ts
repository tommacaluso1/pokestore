// Centralised constants. Any magic number that drives product or security
// behavior belongs here — not scattered across pages.

export const MARKETPLACE_PAGE_SIZE = 50;
export const MARKETPLACE_PAGE_SIZE_MAX = 100;
export const LEADERBOARD_TOP_N = 10;
export const ADMIN_ORDERS_PAGE_SIZE = 50;

// Trust / fraud
export const REPORT_RATE_LIMIT_PER_DAY = 3;
export const REPORT_RISKSCORE_INCREMENT = 5;
export const LOW_REVIEW_RISKSCORE_INCREMENT = 3;
export const LOW_REVIEW_THRESHOLD = 2;

// XP rewards — mirrored in services/xp.ts via reason enum
export const XP_LISTING_CREATED = 10;
export const XP_OFFER_SENT = 5;
export const XP_TRADE_COMPLETED = 100;
export const XP_SALE_COMPLETED = 75;
export const XP_CARD_ACQUIRED = 5;
export const XP_REFERRAL_BONUS = 200;
export const XP_FIRST_LISTING_BONUS = 50;
export const XP_FIRST_TRADE_BONUS = 100;
export const XP_FIRST_SALE_BONUS = 75;
