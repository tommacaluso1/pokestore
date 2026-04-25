import { z } from "zod";

// ─── Primitives ─────────────────────────────────────────────────────────────

export const Cuid = z.string().min(1).max(50);
export const Email = z.string().email().max(254).toLowerCase().trim();
export const Password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .refine((v) => /[^a-zA-Z]/.test(v), "Password must contain at least one number or symbol.");

export const CONDITIONS = ["MINT", "NEAR_MINT", "LIGHTLY_PLAYED", "MODERATELY_PLAYED", "HEAVILY_PLAYED", "DAMAGED"] as const;
export const LISTING_TYPES = ["TRADE", "SALE", "TRADE_OR_SALE"] as const;
export const OFFER_TYPES = ["CASH", "TRADE", "MIXED"] as const;
export const REPORT_REASONS = ["FAKE_LISTING", "ITEM_NOT_RECEIVED", "WRONG_ITEM_SENT", "HARASSMENT", "SCAM", "OTHER"] as const;
export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export const PRODUCT_TYPES = ["PACK", "BOX", "ETB", "BUNDLE"] as const;

export const AVATAR_IDS = [
  "gengar", "pikachu", "eevee", "mewtwo", "charizard", "bulbasaur",
  "squirtle", "umbreon", "espeon", "lucario", "garchomp", "sylveon",
] as const;
export const THEME_IDS = ["purple", "midnight", "gold", "crimson", "forest", "ocean"] as const;

// ─── Auth ───────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  email:        Email,
  name:         z.string().trim().min(1).max(50),
  password:     Password,
  referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{1,16}$/).optional().or(z.literal("")),
});

export const LoginSchema = z.object({
  email:    Email,
  password: z.string().min(1).max(128), // don't apply strength rules on login
});

// ─── Marketplace ────────────────────────────────────────────────────────────

export const CreateListingSchema = z.object({
  userCardId:  Cuid,
  quantity:    z.number().int().min(1).max(999),
  listingType: z.enum(LISTING_TYPES),
  askingPrice: z.number().positive().max(99999).optional(),
  description: z.string().trim().max(2000).optional(),
}).refine(
  (v) => v.listingType === "TRADE" || v.askingPrice !== undefined,
  { message: "An asking price is required for sale listings.", path: ["askingPrice"] },
);

export const OfferedCardSchema = z.object({
  userCardId: Cuid,
  quantity:   z.number().int().min(1).max(99),
});

export const MakeOfferSchema = z.object({
  offerType:    z.enum(OFFER_TYPES),
  cashAmount:   z.number().min(0.01).max(99999).optional(),
  offeredCards: z.array(OfferedCardSchema).max(20).optional(),
  message:      z.string().trim().max(1000).optional(),
}).superRefine((v, ctx) => {
  if ((v.offerType === "CASH" || v.offerType === "MIXED") && v.cashAmount === undefined) {
    ctx.addIssue({ code: "custom", path: ["cashAmount"], message: "Cash amount required." });
  }
  if ((v.offerType === "TRADE" || v.offerType === "MIXED") && (!v.offeredCards || v.offeredCards.length === 0)) {
    ctx.addIssue({ code: "custom", path: ["offeredCards"], message: "At least one offered card required." });
  }
});

// ─── Reviews / Reports ──────────────────────────────────────────────────────

export const CreateReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const FileReportSchema = z.object({
  reason:      z.enum(REPORT_REASONS),
  description: z.string().trim().max(1000).optional(),
  offerId:     Cuid.optional(),
});

// ─── Profile ────────────────────────────────────────────────────────────────

export const UpdateProfileSchema = z.object({
  avatarId: z.enum(AVATAR_IDS).optional(),
  themeId:  z.enum(THEME_IDS).optional(),
  bio:      z.string().trim().max(160).optional(),
});

export const ShowcaseSlotSchema = z.object({
  position:    z.number().int().min(1).max(3),
  userBadgeId: Cuid.nullable(),
});

export const FeaturedSlotSchema = z.object({
  position:   z.number().int().min(1).max(3),
  userCardId: Cuid.nullable(),
});

// ─── Admin ──────────────────────────────────────────────────────────────────

export const UpdateStockSchema = z.object({
  stock: z.number().int().min(0).max(999999),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const UpdateUserRoleSchema = z.object({
  role: z.enum(ROLES),
});

export const AdminInventorySchema = z.object({
  userId:    Cuid,
  cardId:    z.string().min(1).max(100),
  condition: z.enum(CONDITIONS),
  quantity:  z.number().int().min(1).max(999),
  foil:      z.boolean(),
});

// ─── Cart ───────────────────────────────────────────────────────────────────

export const CartQuantitySchema = z.number().int().min(0).max(99);

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse a zod schema; on failure, returns the first error message.
 * Keeps server actions quiet and consistent.
 */
export function safeParse<T extends z.ZodTypeAny>(
  schema: T,
  input: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; error: string } {
  const result = schema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  const first = result.error.issues[0];
  return { ok: false, error: first?.message ?? "Invalid input." };
}
