import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "PokéStore — Pokémon Booster Packs",
  description: "Shop authentic Pokémon booster packs, boxes, and Elite Trainer Boxes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 sm:px-8 py-10 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Footer />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "oklch(0.14 0.06 285)",
              border: "1px solid oklch(0.22 0.08 285 / 0.8)",
              color: "oklch(0.95 0.02 285)",
            },
          }}
        />
      </body>
    </html>
  );
}
