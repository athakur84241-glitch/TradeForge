"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronDown, CircleHelp, LogOut, Menu, Search, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { workspaceUser } from "@/features/workspace/mock-data";
import { NavigationLinks } from "./workspace-navigation";
import { TradeForgeBrand } from "./brand";

/** Derive display name and initials from a Supabase user. */
function resolveUser(user: User | null): { name: string; initials: string } {
  if (!user) return { name: workspaceUser.name, initials: workspaceUser.initials };

  const fullName: string = (user.user_metadata?.full_name as string | undefined) ?? "";
  if (fullName.trim()) {
    const parts = fullName.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : parts[0].slice(0, 2).toUpperCase();
    return { name: fullName.trim(), initials };
  }

  // Fall back to email prefix
  const emailName = user.email?.split("@")[0] ?? "User";
  return { name: emailName, initials: emailName.slice(0, 2).toUpperCase() };
}

export function TopNavigation() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [accountOptions, setAccountOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedAccountValue, setSelectedAccountValue] = useState("");

  // Listen for notification count changes from other components
  useEffect(() => {
    function updateUnreadNotifications(event: Event) {
      setUnreadNotifications((event as CustomEvent<number>).detail);
    }

    window.addEventListener("tradeforge:notification-count", updateUnreadNotifications);
    return () => window.removeEventListener("tradeforge:notification-count", updateUnreadNotifications);
  }, []);

  // Fetch the current Supabase user on mount and subscribe to auth changes
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    function handleAccountsUpdated(event: Event) {
      const detail = (event as CustomEvent<{ accounts?: Array<{ id: string; name: string }>; selectedAccountId?: string | null }>).detail;
      if (detail?.accounts) {
        setAccountOptions(detail.accounts);
      }
      if (typeof detail?.selectedAccountId !== "undefined") {
        setSelectedAccountValue(detail.selectedAccountId ?? "");
      }
    }

    window.addEventListener("tradeforge:accounts-updated", handleAccountsUpdated as EventListener);
    return () => window.removeEventListener("tradeforge:accounts-updated", handleAccountsUpdated as EventListener);
  }, []);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search?q=${encodeURIComponent(value)}` : "/search");
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/sign-in");
    router.refresh();
  }

  const { name, initials } = resolveUser(currentUser);

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
            aria-label={
              unreadNotifications > 0
                ? `Open notifications, ${unreadNotifications} unread`
                : "Open notifications"
            }
          >
            <Bell className="size-5" />
            {unreadNotifications > 0 && (
              <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-primary ring-2 ring-background" />
            )}
          </Link>
          {accountOptions.length > 0 ? (
            <label className="hidden items-center gap-2 rounded-tf-md border border-border bg-surface px-3 text-xs text-muted-foreground xl:flex">
              <span className="sr-only">Active account</span>
              <select
                aria-label="Active account"
                value={selectedAccountValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setSelectedAccountValue(nextValue);
                  window.dispatchEvent(new CustomEvent("tradeforge:account-selected", { detail: { accountId: nextValue } }));
                }}
                className="h-9 max-w-44 bg-transparent text-sm font-medium text-foreground outline-none"
              >
                {accountOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <details className="group relative">
            <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-tf-md p-1.5 text-left hover:bg-white/[.06] [&::-webkit-details-marker]:hidden">
              <span className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {initials}
              </span>
              <span className="hidden text-sm font-semibold sm:block">{name}</span>
              <ChevronDown className="hidden size-4 text-muted-foreground transition-transform group-open:rotate-180 sm:block" />
            </summary>
            <div className="absolute right-0 top-12 w-52 rounded-tf-md border border-border bg-card p-1 shadow-card">
              <Link
                className="block rounded-tf-sm px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.06] hover:text-foreground"
                href="/profile"
              >
                View profile
              </Link>
              <Link
                className="block rounded-tf-sm px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.06] hover:text-foreground"
                href="/settings"
              >
                Workspace settings
              </Link>
              <hr className="my-1 border-border" />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-tf-sm px-3 py-2 text-sm text-muted-foreground hover:bg-white/[.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="size-4" />
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
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
