import Image from "next/image";
import { cn } from "@/lib/utils";

const BASE = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";

export const AVATARS: Record<string, { sprite: string; bg: string; label: string }> = {
  gengar:    { sprite: `${BASE}/94.png`,  bg: "from-violet-600 to-purple-900",  label: "Gengar"    },
  pikachu:   { sprite: `${BASE}/25.png`,  bg: "from-yellow-400 to-amber-600",   label: "Pikachu"   },
  eevee:     { sprite: `${BASE}/133.png`, bg: "from-amber-500 to-orange-700",   label: "Eevee"     },
  mewtwo:    { sprite: `${BASE}/150.png`, bg: "from-indigo-400 to-purple-700",  label: "Mewtwo"    },
  charizard: { sprite: `${BASE}/6.png`,   bg: "from-orange-500 to-red-700",     label: "Charizard" },
  bulbasaur: { sprite: `${BASE}/1.png`,   bg: "from-emerald-400 to-green-700",  label: "Bulbasaur" },
  squirtle:  { sprite: `${BASE}/7.png`,   bg: "from-sky-400 to-blue-700",       label: "Squirtle"  },
  umbreon:   { sprite: `${BASE}/197.png`, bg: "from-indigo-700 to-slate-900",   label: "Umbreon"   },
  espeon:    { sprite: `${BASE}/196.png`, bg: "from-pink-400 to-fuchsia-700",   label: "Espeon"    },
  lucario:   { sprite: `${BASE}/448.png`, bg: "from-blue-500 to-indigo-700",    label: "Lucario"   },
  garchomp:  { sprite: `${BASE}/445.png`, bg: "from-cyan-500 to-blue-800",      label: "Garchomp"  },
  sylveon:   { sprite: `${BASE}/700.png`, bg: "from-pink-300 to-rose-600",      label: "Sylveon"   },
};

type Props = {
  avatarId?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "size-8",
  md: "size-12",
  lg: "size-20",
  xl: "size-28",
};

export function AvatarDisplay({ avatarId, size = "md", className }: Props) {
  const avatar = AVATARS[avatarId ?? "gengar"] ?? AVATARS["gengar"]!;
  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br flex items-center justify-center shrink-0 select-none relative overflow-hidden",
        `bg-gradient-to-br ${avatar.bg}`,
        SIZES[size],
        className,
      )}
    >
      <Image
        src={avatar.sprite}
        alt={avatar.label}
        fill
        className="object-contain p-[12%]"
        unoptimized
      />
    </div>
  );
}
