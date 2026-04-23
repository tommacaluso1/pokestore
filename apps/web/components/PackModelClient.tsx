"use client";

import dynamic from "next/dynamic";
import type { PackModelProps } from "./PackModel";

const PackModel = dynamic(
  () => import("./PackModel").then((m) => m.PackModel),
  { ssr: false, loading: () => <div className="w-full h-full bg-secondary/20 rounded-xl animate-pulse" /> }
);

export function PackModelClient(props: PackModelProps) {
  return <PackModel {...props} />;
}
