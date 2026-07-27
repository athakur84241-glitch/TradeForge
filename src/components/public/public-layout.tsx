"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/workspace/app-shell";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isPublicHome = pathname === "/home" || pathname.startsWith("/home#");

  return isPublicHome ? <>{children}</> : <AppShell>{children}</AppShell>;
}
