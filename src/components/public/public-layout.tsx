"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/workspace/app-shell";

/** Routes that render without the AppShell workspace chrome. */
const PUBLIC_PATHS = ["/home", "/sign-in", "/sign-up", "/forgot-password"];

function isPublicPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/auth/")
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return isPublicPath(pathname) ? <>{children}</> : <AppShell>{children}</AppShell>;
}

