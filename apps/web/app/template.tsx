"use client";

import { motion } from "framer-motion";

// Next App Router: template.tsx rerenders on navigation (unlike layout.tsx).
// Each page fades in with a slight rise — keeps the ghost aesthetic consistent
// without a heavy route-transition stack.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
