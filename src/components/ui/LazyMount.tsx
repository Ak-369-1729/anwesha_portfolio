"use client";

import { useRef } from "react";
import { useInView } from "@/lib/hooks";

/** Renders children only once the placeholder approaches the viewport — keeps initial hydration light. */
export function LazyMount({
  children,
  placeholderClassName,
  margin = "500px 0px",
}: {
  children: React.ReactNode;
  placeholderClassName: string;
  margin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, margin, true);
  if (seen) return <>{children}</>;
  return <div ref={ref} className={placeholderClassName} aria-hidden="true" />;
}
