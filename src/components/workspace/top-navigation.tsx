"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, Menu, Search, X } from "lucide-react";
import { workspaceUser } from "@/features/workspace/mock-data";
import { NavigationLinks } from "./workspace-navigation";
import { TradeForgeBrand } from "./brand";

export function TopNavigation() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);

  useEffect(() => {
    function updateUnreadNotifications(event: Event) {
      setUnreadNotifications((event as CustomEvent<number>).detail);
    }

    window.addEventListener("tradeforge:notification-count", updateUnreadNotifications);
    return () => window.removeEventListener("tradeforge:notification-count", updateUnreadNotifications);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          className="grid size-10 shrink-0 place-items-center rounded-tf-md text-muted-foreground hover:bg-white/[.06] hover:text-foreground lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-workspace-navigation"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <form onSubmit={submitSearch} role="search" className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-tf-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground hover:border-white/20 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            aria-label="Search workspace"
            placeholder="Search accounts, rules, payouts"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href="/search?q=rules"
            className="grid size-10 place-items-center rounded-tf-md text-muted-foreground transition-colors hover:bg-white/[.06] hover:text-foreground"
            aria-label="Search help and rules"
          >
            <CircleHelp className="size-5" />
          </Link>
          <Link
            href="/notifications"
            className="relative grid size-10 place-items-center rounded-tf-md text-muted-foreground transition-colors hover:bg-white/[.06] hover:text-foreground"
            aria-label={unreadNotifications > 0 ? `Open notifications, ${unreadNotifications} unread` : "Open notifications"}
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 && (
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </Link>
          <label className="hidden items-center gap-2 rounded-tf-md border border-border bg-surface px-3 text-xs text-muted-foreground xl:flex">
            <span className="sr-only">Active account</span>
            <select
              aria-label="Active account"
              defaultValue="TF-82104"
              className="h-9 max-w-44 bg-transparent text-sm font-medium text-foreground outline-none"
            >
              <option value="TF-82104">Apex Evaluation 100K</option>
              <option value="TF-91582">Apex Evaluation 50K</option>
              <option value="TF-67144">Forge Funded 100K</option>
            </select>
          </label>
          <details className="group relative">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-tf-md p-1.5 text-left hover:bg-white/[.06] [&::-webkit-details-marker]:hidden">
              <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {workspaceUser.initials}
              </span>
              <span className="hidden text-sm font-semibold sm:block">{workspaceUser.name}</span>
              <ChevronDown className="hidden size-4 text-muted-foreground transition-transform group-open:rotate-180 sm:block" />
            </summary>
            <div className="absolute right-0 top-12 w-52 rounded-tf-md border border-border bg-card p-1 shadow-card">
              <Link className="block rounded-tf-sm px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.06] hover:text-foreground" href="/profile">
                View profile
              </Link>
              <Link className="block rounded-tf-sm px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.06] hover:text-foreground" href="/settings">
                Workspace settings
              </Link>
            </div>
          </details>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-workspace-navigation" className="border-t border-border bg-card p-4 lg:hidden">
          <div className="mb-5">
            <TradeForgeBrand />
          </div>
          <NavigationLinks onNavigate={() => setMobileOpen(false)} />
        </div>
      )}
    </header>
  );
}
