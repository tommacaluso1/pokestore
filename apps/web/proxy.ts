import NextAuth from "next-auth";
import authConfig from "./auth.config";

// Next 16 Proxy (formerly middleware). Gates URL-level access using Auth.js v5
// `authorized` callback in auth.config.ts. Importing auth.config (edge-safe)
// keeps Prisma/bcrypt out of the proxy bundle.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/marketplace/new",
    "/marketplace/my-listings",
    "/marketplace/my-offers",
    "/profile",
    "/profile/edit",
    "/orders/:path*",
    "/checkout/:path*",
  ],
};
