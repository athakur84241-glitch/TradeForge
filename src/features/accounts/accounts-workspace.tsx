"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleDollarSign,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { accounts } from "@/features/workspace/mock-data";
import type { Account } from "@/features/workspace/types";

const categories = ["All", "Evaluation", "Funded", "Passed", "Failed", "Archived"] as const;
type CategoryFilter = (typeof categories)[number];

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function statusTone(status: Account["status"]) {
  if (status === "Failed") return "danger" as const;
  if (status === "Archived") return "neutral" as const;
  if (status === "Funded" || status === "Passed") return "success" as const;
  return "primary" as const;
}

export function AccountsWorkspace() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [sortKey, setSortKey] = useState<keyof Account>("status");
  const [descending, setDescending] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 4;

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return accounts
      .filter((account) => category === "All" || account.category === category)
      .filter((account) => !normalized || `${account.name} ${account.id} ${account.platform}`.toLowerCase().includes(normalized))
      .sort((left, right) => {
        const statusOrder: Record<Account["status"], number> = {
          Active: 0,
          Funded: 1,
          Passed: 2,
          Failed: 3,
          Archived: 4,
        };
        const result = sortKey === "status"
          ? statusOrder[left.status] - statusOrder[right.status]
          : String(left[sortKey]).localeCompare(String(right[sortKey]), undefined, { numeric: true });
        return descending ? -result : result;
      });
  }, [category, descending, query, sortKey]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, page * pageSize + pageSize);

  function chooseCategory(next: CategoryFilter) {
    setCategory(next);
    setPage(0);
  }

  function sortBy(next: keyof Account) {
    if (sortKey === next) {
      setDescending((value) => !value);
    } else {
      setSortKey(next);
      setDescending(false);
    }
    setPage(0);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Accounts"
        title="Your trading accounts"
        description="Monitor evaluation and funded accounts in one clear workspace with status, equity, PnL, and recent activity."
        action={
          <Button asChild>
            <Link href="/challenges">Explore challenges</Link>
          </Button>
        }
      />

      <section aria-label="Account summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active accounts", value: "3", detail: "2 evaluations · 1 funded", icon: WalletCards, tone: "text-primary" },
          { label: "Total equity", value: "$258,450.90", detail: "Across active accounts", icon: CircleDollarSign, tone: "text-foreground" },
          { label: "Available reward", value: "$2,840.00", detail: "Demo funded balance", icon: ShieldCheck, tone: "text-success" },
          { label: "Passed accounts", value: "1", detail: "Archived separately", icon: CircleCheck, tone: "text-success" },
        ].map(({ label, value, detail, icon: Icon, tone }) => (
          <article key={label} className="rounded-tf-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className={`size-5 ${tone}`} />
            </div>
            <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
            <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-tf-lg border border-border bg-card" aria-labelledby="account-list-title">
        <div className="flex flex-col gap-4 border-b border-border p-5">
          <div>
            <h2 id="account-list-title" className="text-base font-semibold">Account workspace</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search, filter, sort, and review every demo account state.</p>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search accounts</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
                type="search"
                placeholder="Search by account, ID, or platform"
                className="h-10 w-full rounded-tf-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-tf-md border border-border bg-surface p-1" role="group" aria-label="Filter accounts">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseCategory(item)}
                  aria-pressed={category === item}
                  className={`min-h-8 whitespace-nowrap rounded px-3 text-xs font-semibold transition-colors ${
                    category === item ? "bg-primary-solid text-primary-solid-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>
                {[
                  ["name", "Account"],
                  ["status", "Status"],
                  ["balance", "Balance"],
                  ["equity", "Equity"],
                  ["pnl", "PnL"],
                  ["phase", "Phase"],
                  ["createdAt", "Created"],
                  ["lastActivity", "Last activity"],
                ].map(([key, label]) => (
                  <th key={key} className="px-5 py-3 font-medium">
                    <button type="button" onClick={() => sortBy(key as keyof Account)} className="inline-flex items-center gap-1.5 hover:text-foreground">
                      {label} <ArrowDownUp className="size-3" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((account) => (
                <tr key={account.id} className="border-b border-border/70 last:border-0 hover:bg-white/[.025]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-foreground">{account.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{account.id} · {account.platform}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge tone={statusTone(account.status)}>{account.status}</StatusBadge></td>
                  <td className="px-5 py-4 text-muted-foreground">{money(account.balance)}</td>
                  <td className="px-5 py-4 text-muted-foreground">{money(account.equity)}</td>
                  <td className={`px-5 py-4 font-semibold ${account.pnl >= 0 ? "text-success" : "text-danger"}`}>
                    {account.pnl >= 0 ? "+" : ""}{money(account.pnl)}
                    <span className="ml-1 text-xs font-normal">({account.pnlPercent.toFixed(2)}%)</span>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{account.phase}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.createdAt}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.lastActivity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visible.length === 0 ? (
          <div className="grid min-h-48 place-items-center border-t border-border p-6 text-center">
            <div>
              <Archive className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-3 font-semibold">No accounts match</p>
              <p className="mt-2 text-sm text-muted-foreground">Clear the search or select another status.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span>Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}</span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={page === 0} onClick={() => setPage((value) => value - 1)} aria-label="Previous page">
                <ChevronLeft className="size-4" />
              </Button>
              <span>Page {page + 1} of {pages}</span>
              <Button type="button" variant="ghost" size="icon" className="size-8" disabled={page >= pages - 1} onClick={() => setPage((value) => value + 1)} aria-label="Next page">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
