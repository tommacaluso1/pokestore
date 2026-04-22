import { cn } from "@/lib/utils";

export const AVATARS: Record<string, { emoji: string; bg: string; label: string }> = {
  gengar:    { emoji: "👻", bg: "from-violet-600 to-purple-900",  label: "Gengar"    },
  pikachu:   { emoji: "⚡", bg: "from-yellow-400 to-amber-600",   label: "Pikachu"   },
  eevee:     { emoji: "🦊", bg: "from-amber-500 to-orange-700",   label: "Eevee"     },
  mewtwo:    { emoji: "🔮", bg: "from-indigo-400 to-purple-700",  label: "Mewtwo"    },
  charizard: { emoji: "🔥", bg: "from-orange-500 to-red-700",     label: "Charizard" },
  bulbasaur: { emoji: "🌿", bg: "from-emerald-400 to-green-700",  label: "Bulbasaur" },
  squirtle:  { emoji: "💧", bg: "from-sky-400 to-blue-700",       label: "Squirtle"  },
  umbreon:   { emoji: "🌙", bg: "from-indigo-700 to-slate-900",   label: "Umbreon"   },
  espeon:    { emoji: "☀️", bg: "from-pink-400 to-fuchsia-700",   label: "Espeon"    },
  lucario:   { emoji: "⭐", bg: "from-blue-500 to-indigo-700",    label: "Lucario"   },
  garchomp:  { emoji: "🦈", bg: "from-cyan-500 to-blue-800",      label: "Garchomp"  },
  sylveon:   { emoji: "🎀", bg: "from-pink-300 to-rose-600",      label: "Sylveon"   },
};

type Props = {
  avatarId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "size-8 text-base",
  md: "size-12 text-2xl",
  lg: "size-20 text-4xl",
  xl: "size-28 text-5xl",
};

export function AvatarDisplay({ avatarId, size = "md", className }: Props) {
  const avatar = AVATARS[avatarId ?? "gengar"] ?? AVATARS["gengar"]!;
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 select-none",
        `bg-gradient-to-br ${avatar.bg}`,
        SIZES[size],
        className,
      )}
    >
      <span role="img" aria-label={avatar.label}>{avatar.emoji}</span>
    </div>
  );
}
