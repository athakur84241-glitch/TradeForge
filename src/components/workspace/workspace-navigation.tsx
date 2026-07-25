"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CircleDollarSign,
  LayoutDashboard,
  Medal,
  Settings,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeForgeBrand } from "./brand";

export const navigationItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Challenges", href: "/challenges", icon: Trophy },
  { label: "Accounts", href: "/accounts", icon: CircleDollarSign },
  { label: "Payouts", href: "/payouts", icon: ShieldCheck },
  { label: "Leaderboard", href: "/leaderboard", icon: Medal },
  { label: "Profile", href: "/profile", icon: UserRound },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavigationLinks({
  onNavigate,
  compact = false,
}: {
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary navigation" className="grid gap-1">
      {navigationItems.map(({ label, href, icon: Icon }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-tf-md px-3 text-sm font-medium transition-all duration-300 ease-out",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-white/[.05] hover:text-foreground hover:scale-[1.01]",
              compact && "justify-center px-2",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <span className={cn(compact && "sr-only")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function WorkspaceNavigation() {
  const pathname = usePathname();
  const quickItems = navigationItems.slice(0, 5);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-20 flex-col border-r border-border bg-background/95 px-3 py-5 backdrop-blur-xl lg:flex xl:w-[248px] xl:px-4">
        <div className="hidden xl:block">
          <TradeForgeBrand />
        </div>
        <div className="mx-auto xl:hidden">
          <TradeForgeBrand compact />
        </div>
        <div className="mt-9">
          <div className="xl:hidden">
            <NavigationLinks compact />
          </div>
          <div className="hidden xl:block">
            <NavigationLinks />
          </div>
        </div>
        <div className="mt-auto hidden rounded-tf-lg border border-border bg-surface p-4 xl:block">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-primary">Risk first</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Review account limits before every trading session.
          </p>
        </div>
      </aside>

      <nav
        aria-label="Mobile quick navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 px-2 py-2 backdrop-blur-xl lg:hidden"
      >
        {quickItems.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "grid min-h-11 place-items-center rounded-tf-sm transition-all duration-300 ease-out",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:scale-[1.01]",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="sr-only">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
