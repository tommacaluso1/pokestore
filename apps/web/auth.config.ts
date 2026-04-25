import type { NextAuthConfig } from "next-auth";

const isProd = process.env.NODE_ENV === "production";

// Edge-safe config: no Prisma, no bcrypt. Imported by both auth.ts (node)
// and proxy.ts (edge). Explicit cookie + session config so we don't rely on
// ambient library defaults when behind proxies / on different runtimes.
export default {
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge:    30 * 24 * 60 * 60,  // 30 days
    updateAge: 24 * 60 * 60,       // refresh sliding window once per day
  },

  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        secure:   isProd,
      },
    },
  },

  pages: { signIn: "/login" },
  providers: [],

  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const role = session?.user?.role;

      if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) return false;
        if (role !== "ADMIN") return Response.redirect(new URL("/", nextUrl));
        return true;
      }
      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
