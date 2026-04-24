import Link from "next/link";
import Image from "next/image";
import { LoginForm } from "./LoginForm";
import { FloatingOrbs } from "@/components/ghost/FloatingOrbs";
import { SectionEyebrow } from "@/components/ghost/SectionEyebrow";

export const metadata = { title: "Sign in — PokéStore" };

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center -mt-6 px-4">
      <FloatingOrbs count={5} />

      <div className="relative w-full max-w-sm">
        {/* Gengar + wordmark */}
        <div className="text-center mb-8">
          <div className="relative w-28 h-28 mx-auto mb-5">
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/3 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.25_295/0.6),transparent_70%)] blur-xl animate-breathe" />
            <div aria-hidden className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.25_295/0.35),transparent_70%)] blur-2xl" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="relative object-contain drop-shadow-[0_0_32px_oklch(0.55_0.25_295/0.75)] animate-float"
              unoptimized
              priority
            />
          </div>
          <SectionEyebrow sigil="✦" accent="violet" className="mb-3">Séance open</SectionEyebrow>
          <Link href="/" className="block mt-2 font-display text-4xl tracking-[-0.04em] hover:opacity-80 transition-opacity">
            <span className="ghost-text">Welcome</span> back
          </Link>
          <p className="text-muted-foreground text-sm mt-2">The spirits have been expecting you.</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[oklch(0.10_0.05_290/0.75)] backdrop-blur-xl border border-[oklch(0.55_0.25_295/0.3)] p-6 shadow-[0_24px_64px_-12px_oklch(0_0_0/0.7),0_0_0_1px_oklch(0.55_0.25_295/0.15),0_0_48px_-8px_oklch(0.55_0.25_295/0.3)]">
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.70_0.22_295/0.5)] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,oklch(0.55_0.25_295/0.12),transparent_70%)]" />

          <div className="relative">
            <LoginForm />
            <p className="text-sm text-muted-foreground text-center mt-6">
              No account?{" "}
              <Link href="/register" className="text-[oklch(0.88_0.12_295)] font-medium hover:text-[oklch(0.92_0.12_295)] transition-colors">
                Answer the séance
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
