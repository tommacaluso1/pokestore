export const THEMES = [
  { id: "purple",   label: "Gengar",   color: "#7c3aed", unlockLevel: 1  },
  { id: "midnight", label: "Midnight", color: "#4338ca", unlockLevel: 1  },
  { id: "gold",     label: "Gold",     color: "#d97706", unlockLevel: 10 },
  { id: "crimson",  label: "Crimson",  color: "#dc2626", unlockLevel: 20 },
  { id: "forest",   label: "Forest",   color: "#059669", unlockLevel: 15 },
  { id: "ocean",    label: "Ocean",    color: "#0891b2", unlockLevel: 30 },
] as const;

export type Theme = typeof THEMES[number];
