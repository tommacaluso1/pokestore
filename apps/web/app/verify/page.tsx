import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, AlertTriangle, Clock3, Sparkles } from "lucide-react";
import { consumeVerificationToken } from "@/lib/auth/verification";
import { GlowButton } from "@/components/ghost/GlowButton";
import { SectionEyebrow } from "@/components/ghost/SectionEyebrow";
import { FloatingOrbs } from "@/components/ghost/FloatingOrbs";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verify · PokéStore" };

type Props = { searchParams: Promise<{ token?: string }> };

export default async function VerifyPage({ searchParams }: Props) {
  const { token } = await searchParams;

  // No token at all — explain what this page is for.
  if (!token) {
    return <Frame eyebrow="Awaiting" sigil="✦">
      <Header
        title="No verification link"
        body="This page validates a verification link from your email. If you opened this on your own, head back to your profile and resend the email."
        accent="violet"
      />
      <Actions>
        <Link href="/profile"><Button variant="outline">Go to profile</Button></Link>
        <Link href="/"><GlowButton>Home</GlowButton></Link>
      </Actions>
    </Frame>;
  }

  const result = await consumeVerificationToken(token);

  if (result.ok) {
    return <Frame eyebrow="Verified" sigil="✦" accent="cyan">
      <Header
        icon={<CheckCircle2 className="size-12 text-[oklch(0.86_0.16_150)] drop-shadow-[0_0_24px_oklch(0.55_0.16_150/0.55)]" />}
        title="Email verified"
        body="The séance recognises you. Listing, trading, and reviews are now unlocked."
        accent="cyan"
      />
      <Actions>
        <Link href="/marketplace"><GlowButton accent="cyan">Open the marketplace</GlowButton></Link>
        <Link href="/profile"><Button variant="outline">Go to profile</Button></Link>
      </Actions>
    </Frame>;
  }

  if (result.reason === "already") {
    return <Frame eyebrow="Already verified" sigil="✧">
      <Header
        icon={<Sparkles className="size-12 text-[oklch(0.85_0.16_295)] drop-shadow-[0_0_24px_oklch(0.55_0.25_295/0.55)]" />}
        title="You're already verified"
        body="Nothing more to do here — the spirits remember you."
        accent="violet"
      />
      <Actions>
        <Link href="/marketplace"><GlowButton>Open the marketplace</GlowButton></Link>
      </Actions>
    </Frame>;
  }

  if (result.reason === "expired") {
    return <Frame eyebrow="Expired" sigil="◇" accent="gold">
      <Header
        icon={<Clock3 className="size-12 text-[oklch(0.85_0.16_88)] drop-shadow-[0_0_24px_oklch(0.82_0.16_88/0.55)]" />}
        title="That link timed out"
        body="Verification links live for 24 hours. Resend a new one from your profile and try again."
        accent="gold"
      />
      <Actions>
        <Link href="/profile"><GlowButton>Go to profile</GlowButton></Link>
        <Link href="/"><Button variant="outline">Home</Button></Link>
      </Actions>
    </Frame>;
  }

  return <Frame eyebrow="Invalid" sigil="◇" accent="magenta">
    <Header
      icon={<AlertTriangle className="size-12 text-[oklch(0.78_0.22_30)] drop-shadow-[0_0_24px_oklch(0.62_0.22_25/0.55)]" />}
      title="That link doesn't look right"
      body="It may have already been used or copied incorrectly. Resend a fresh one from your profile."
      accent="magenta"
    />
    <Actions>
      <Link href="/profile"><GlowButton>Go to profile</GlowButton></Link>
      <Link href="/"><Button variant="outline">Home</Button></Link>
    </Actions>
  </Frame>;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function Frame({
  children, eyebrow, sigil = "✦", accent = "violet",
}: {
  children: React.ReactNode; eyebrow: string; sigil?: string;
  accent?: "violet" | "cyan" | "magenta" | "gold";
}) {
  return (
    <div className="relative min-h-[calc(100vh-7rem)] flex items-center justify-center -mt-6 px-4">
      <FloatingOrbs count={5} />
      <div className="relative w-full max-w-md text-center">
        <SectionEyebrow sigil={sigil} accent={accent}>{eyebrow}</SectionEyebrow>
        <div className="mt-4 relative overflow-hidden rounded-2xl bg-[oklch(0.10_0.05_290/0.75)] backdrop-blur-xl border border-[oklch(0.55_0.25_295/0.3)] p-8 shadow-[0_24px_64px_-12px_oklch(0_0_0/0.7),0_0_0_1px_oklch(0.55_0.25_295/0.15),0_0_48px_-8px_oklch(0.55_0.25_295/0.3)]">
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.70_0.22_295/0.5)] to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_0%,oklch(0.55_0.25_295/0.12),transparent_70%)]" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Header({
  title, body, icon, accent,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
  accent: "violet" | "cyan" | "gold" | "magenta";
}) {
  const accentColor: Record<typeof accent, string> = {
    violet:  "from-[oklch(0.78_0.22_295)] to-[oklch(0.88_0.12_295)]",
    cyan:    "from-[oklch(0.78_0.20_295)] to-[oklch(0.74_0.15_220)]",
    gold:    "from-[oklch(0.85_0.16_88)]  to-[oklch(0.92_0.14_88)]",
    magenta: "from-[oklch(0.78_0.24_335)] to-[oklch(0.85_0.16_295)]",
  };

  return (
    <>
      <div className="flex justify-center mb-5 relative w-16 h-16 mx-auto">
        {!icon && (
          <Image
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png"
            alt="" fill unoptimized
            className="object-contain animate-float drop-shadow-[0_0_24px_oklch(0.55_0.25_295/0.55)]"
          />
        )}
        {icon}
      </div>
      <h1 className={`font-display text-3xl tracking-[-0.04em] mb-3 bg-gradient-to-r ${accentColor[accent]} bg-clip-text text-transparent`}>
        {title}
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">{body}</p>
    </>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>;
}
