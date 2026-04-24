import type { Metadata } from "next";
import { Unbounded, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientField } from "@/components/ghost/AmbientField";

const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PokéStore — Ghost Card Marketplace",
  description: "A séance for collectors. Authentic Pokémon booster packs, box-breaks, and peer-to-peer card trades in a haunted little storefront.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="relative overflow-x-hidden">
        <AmbientField />
        <Navbar />
        <main className="relative z-[1] max-w-5xl mx-auto px-6 sm:px-8 py-10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.06 285)",
              border: "1px solid oklch(0.55 0.24 295 / 0.35)",
              color: "oklch(0.95 0.02 285)",
              boxShadow: "0 8px 40px -8px oklch(0.55 0.24 295 / 0.4)",
            },
          }}
        />
      </body>
    </html>
  );
}
