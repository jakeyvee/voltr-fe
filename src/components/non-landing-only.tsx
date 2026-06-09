"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

/**
 * Renders its children on every route except the landing page ("/"),
 * which supplies its own header and footer.
 */
export default function NonLandingOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return <>{children}</>;
}
