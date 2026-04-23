import Link from "next/link";
import Image from "next/image";
import { RegisterForm } from "./RegisterForm";

export const metadata = { title: "Register — PokéStore" };

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center -mt-6 px-4">
      {/* Background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_50%_50%_at_50%_65%,oklch(0.54_0.24_285/0.13),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025] [background-image:radial-gradient(oklch(0.95_0.02_295)_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="w-full max-w-sm">
        {/* Gengar mascot + branding */}
        <div className="text-center mb-8">
          <div className="relative w-24 h-24 mx-auto mb-5">
            <div aria-hidden className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/3 rounded-full bg-[radial-gradient(ellipse_at_center,oklch(0.54_0.24_285/0.55),transparent_70%)] blur-xl" />
            <Image
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
              alt="Gengar"
              fill
              className="object-contain drop-shadow-[0_0_24px_oklch(0.54_0.24_285/0.65)] animate-[float_4s_ease-in-out_infinite]"
              unoptimized
              priority
            />
          </div>
          <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            <span className="text-primary">Poké</span>Store
          </Link>
          <p className="text-muted-foreground text-sm mt-1.5">Create your account</p>
        </div>

        <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-[0_4px_40px_oklch(0_0_0/0.35),0_0_0_1px_oklch(0.54_0.24_285/0.08)]">
          <RegisterForm />
          <p className="text-sm text-muted-foreground text-center mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground font-medium hover:text-primary transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
