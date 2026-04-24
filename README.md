# pokeStore

Pokémon TCG e-commerce + P2P card marketplace. Buy packs, boxes, and ETBs; list your own cards for sale or trade; dual-confirm trades with a built-in trust layer (ratings, reports, referral XP).

**Live:** https://pokestore-web.vercel.app

## Stack

- **Monorepo:** Turborepo (`apps/web`, `packages/db`, `packages/ui`)
- **App:** Next.js 16 (App Router, Server Components, Proxy middleware)
- **Auth:** Auth.js v5 (Credentials, JWT sessions, edge-safe `auth.config.ts` split)
- **DB:** Prisma 6 + Postgres (Neon)
- **UI:** Tailwind 4 + shadcn/ui + @base-ui/react primitives
- **Payments:** Stripe (optional — gated on env vars)

## Getting started

```sh
# 1. install
npm install

# 2. env
cp .env.example .env
#   fill in DATABASE_URL, DIRECT_URL, AUTH_SECRET at minimum

# 3. apply schema
npm run db:migrate        # dev: creates + applies pending migrations
# — or, in CI / production —
npm run db:migrate:deploy # apply only (no prompts, safe for prod)

# 4. start dev
npm run dev               # http://localhost:3000
```

Test credentials for local: `ash@pokestore.dev` (see `packages/db/prisma/seed.ts`).

## Scripts

| Command                    | Description                                    |
| -------------------------- | ---------------------------------------------- |
| `npm run dev`              | Start Next.js dev server (turbo-orchestrated)  |
| `npm run build`            | Production build                               |
| `npm run check-types`      | Type-check all packages                        |
| `npm run lint`             | Lint all packages                              |
| `npm run db:migrate`       | Create & apply dev migration (prompts)         |
| `npm run db:migrate:deploy`| Apply pending migrations (no prompts)          |
| `npm run db:push`          | Push schema without creating a migration       |
| `npm run db:studio`        | Open Prisma Studio                             |
| `npm run db:seed`          | Seed local DB                                  |
| `npm run db:generate`      | Regenerate Prisma client                       |

## Architecture

```
apps/web/
  app/              # Next.js App Router pages
  components/       # React components (server + client)
  lib/
    services/       # Business logic (trade, marketplace, reviews, reports…)
    queries/        # Read paths (typed return values)
    actions/        # Server actions (form submit targets)
  auth.ts           # NextAuth (Node runtime, includes bcrypt + Prisma)
  auth.config.ts    # Edge-safe config shared with Proxy
  proxy.ts          # URL-level auth gating (Next 16 proxy convention)
  types/            # Module augmentations (e.g. next-auth.d.ts)

packages/db/
  prisma/           # schema.prisma + migrations
  src/              # exported Prisma client (@repo/db)
```

### Trade flow (dual confirmation)

`PENDING → ACCEPTED → sellerConfirmed + offererConfirmed → COMPLETED`

Either party calls `confirmTrade(userId, offerId)`. Only when both flags are true does the atomic card-transfer transaction run. Status is re-checked *inside* the transaction to prevent concurrent double-execution.

### Inventory locking

`getAvailableQuantity(userCardId)` subtracts both active-listing quantities and pending/accepted offer-item quantities. Modify with care — a miscalculation here creates double-offering exploits.

### Trust / fraud layer

- `User.riskScore` increments on low reviews (≤2 stars, +3) and received reports (+5). Rate-limited: max 3 reports per reporter per day, max 1 per (reporter, reported) pair per 24h.
- `Report.adminConfirmed` gates future admin-moderation flows.
- `SellerReview` unique per `(reviewerId, offerId)`.

### Referrals

Registration reads `?ref=CODE`. First completed trade fires `triggerReferralReward()` which awards the referrer 200 XP (idempotent via `XPEvent` unique key).

## Deploy

Main branch auto-deploys to Vercel. Build command:

```sh
npx prisma generate --schema=packages/db/prisma/schema.prisma && npx turbo run build --filter=web
```
