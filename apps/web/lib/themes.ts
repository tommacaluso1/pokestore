export const THEMES = [
  { id: "purple",   label: "Gengar",   color: "#7c3aed", unlockLevel: 1,  emoji: "👻" },
  { id: "midnight", label: "Midnight", color: "#4338ca", unlockLevel: 1,  emoji: "🌙" },
  { id: "gold",     label: "Gold",     color: "#d97706", unlockLevel: 10, emoji: "✨" },
  { id: "crimson",  label: "Crimson",  color: "#dc2626", unlockLevel: 20, emoji: "🔥" },
  { id: "forest",   label: "Forest",   color: "#059669", unlockLevel: 15, emoji: "🍃" },
  { id: "ocean",    label: "Ocean",    color: "#0891b2", unlockLevel: 30, emoji: "🌊" },
] as const;

export type Theme = typeof THEMES[number];
