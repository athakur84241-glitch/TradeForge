"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Crown,
  Medal,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoAction } from "@/components/workspace/demo-action";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { leaderboardTraders } from "@/features/workspace/mock-data";

type Period = "Weekly" | "Monthly";
type SortKey = "rank" | "return" | "winRate" | "profitFactor";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function LeaderboardWorkspace() {
  const [period, setPeriod] = useState<Period>("Weekly");
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("All sizes");
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [descending, setDescending] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 6;

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return leaderboardTraders
      .filter((trader) => !normalized || `${trader.alias} ${trader.country} ${trader.badge}`.toLowerCase().includes(normalized))
      .filter((trader) => size === "All sizes" || trader.accountSize === Number(size))
      .sort((left, right) => {
        const leftValue = sortKey === "return" ? (period === "Weekly" ? left.weeklyReturn : left.monthlyReturn) : left[sortKey];
        const rightValue = sortKey === "return" ? (period === "Weekly" ? right.weeklyReturn : right.monthlyReturn) : right[sortKey];
        const result = leftValue - rightValue;
        return descending ? -result : result;
      });
  }, [descending, period, query, size, sortKey]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const visible = rows.slice(page * pageSize, page * pageSize + pageSize);

  function sortBy(next: SortKey) {
    if (sortKey === next) setDescending((value) => !value);
    else {
      setSortKey(next);
      setDescending(next !== "rank");
    }
    setPage(0);
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Leaderboard"
        title="Performance, measured."
        description="A transparent mock ranking of consistent performance across the TradeForge workspace. No earnings claims are implied."
        action={
          <DemoAction variant="outline" confirmation="Demo ranking exported">
            Export ranking
          </DemoAction>
        }
      />

      <section aria-label="Leaderboard highlights" className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Your current rank" value="#03" detail="Weekly demo ranking" icon={Trophy} tone="warning" trend="up" compact />
        <MetricCard label="Your return" value="+14.26%" detail="Current monthly view" icon={Crown} tone="success" trend="up" compact />
        <MetricCard label="Consistency streak" value="7 days" detail="Risk limits respected" icon={ShieldCheck} tone="primary" trend="up" compact />
      </section>

      <section className="overflow-hidden rounded-tf-lg border border-border bg-card" aria-labelledby="leaderboard-title">
        <div className="grid gap-4 border-b border-border p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 id="leaderboard-title" className="text-base font-semibold">{period} rankings</h2>
              <p className="mt-1 text-sm text-muted-foreground">Mock trader aliases and country codes only.</p>
            </div>
            <div className="flex rounded-tf-sm border border-border bg-surface p-1">
              {(["Weekly", "Monthly"] as const).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setPeriod(item);
                    setPage(0);
                  }}
                  aria-pressed={period === item}
                  className={`min-h-8 rounded px-4 text-xs font-semibold ${
                    period === item ? "bg-primary-solid text-primary-solid-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search leaderboard</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(0);
                }}
                type="search"
                placeholder="Search trader alias, country, or badge"
                className="h-10 w-full rounded-tf-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </label>
            <label>
              <span className="sr-only">Filter by account size</span>
              <select
                value={size}
                onChange={(event) => {
                  setSize(event.target.value);
                  setPage(0);
                }}
                className="h-10 min-w-48 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground"
              >
                <option>All sizes</option>
                {[25000, 50000, 100000, 200000].map((amount) => <option key={amount} value={amount}>{money(amount)}</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[930px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>
                {[
                  { key: "rank", label: "Rank" },
                  { key: null, label: "Trader alias" },
                  { key: null, label: "Country" },
                  { key: null, label: "Account size" },
                  { key: "return", label: `${period} return` },
                  { key: "winRate", label: "Win rate" },
                  { key: "profitFactor", label: "Profit factor" },
                  { key: null, label: "Badge" },
                ].map((column) => (
                  <th key={column.label} className="px-5 py-3 font-medium">
                    {column.key ? (
                      <button type="button" onClick={() => sortBy(column.key as SortKey)} className="inline-flex items-center gap-1.5 hover:text-foreground">
                        {column.label}<ArrowDownUp className="size-3" />
                      </button>
                    ) : column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((trader) => {
                const accountReturn = period === "Weekly" ? trader.weeklyReturn : trader.monthlyReturn;
                return (
                  <tr key={trader.id} className="border-b border-border/70 last:border-0 hover:bg-white/[.025]">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-2 font-display font-semibold ${trader.rank <= 3 ? "text-warning" : "text-foreground"}`}>
                        {trader.rank <= 3 && <Medal className="size-4" />}#{String(trader.rank).padStart(2, "0")}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground">{trader.alias}</td>
                    <td className="px-5 py-4 text-muted-foreground">{trader.country}</td>
                    <td className="px-5 py-4 text-muted-foreground">{money(trader.accountSize)}</td>
                    <td className="px-5 py-4 font-semibold text-success">+{accountReturn.toFixed(2)}%</td>
                    <td className="px-5 py-4 text-muted-foreground">{trader.winRate}%</td>
                    <td className="px-5 py-4 text-muted-foreground">{trader.profitFactor.toFixed(2)}</td>
                    <td className="px-5 py-4"><StatusBadge tone="primary" icon={false}>{trader.badge}</StatusBadge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-muted-foreground">
          <span>Showing {visible.length} of {rows.length} traders</span>
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
      </section>
    </div>
  );
}
