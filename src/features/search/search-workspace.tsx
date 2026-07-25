"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CircleDollarSign,
  FileQuestion,
  Search,
  ShieldCheck,
  Trophy,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { StatusBadge } from "@/components/workspace/status-badge";
import { searchResults } from "@/features/workspace/mock-data";
import type { SearchResult } from "@/features/workspace/types";

const resultTypes = ["All", "Account", "Challenge", "Payout", "Help"] as const;
type ResultFilter = (typeof resultTypes)[number];

const iconByType = {
  Account: WalletCards,
  Challenge: Trophy,
  Payout: CircleDollarSign,
  Help: ShieldCheck,
} satisfies Record<SearchResult["type"], typeof Search>;

export function SearchWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<ResultFilter>("All");

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return searchResults.filter((result) => {
      const matchesType = filter === "All" || result.type === filter;
      const corpus = `${result.title} ${result.description} ${result.keywords.join(" ")}`.toLowerCase();
      return matchesType && (!normalized || corpus.includes(normalized));
    });
  }, [filter, query]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    router.replace(normalized ? `/search?q=${encodeURIComponent(normalized)}` : "/search");
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Search"
        title="Search the workspace"
        description="Find accounts, challenges, payout records, and help topics from one place."
      />

      <section className="overflow-hidden rounded-tf-lg border border-border bg-card">
        <form onSubmit={submit} role="search" className="border-b border-border p-5">
          <label className="relative block">
            <span className="sr-only">Search TradeForge workspace</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
              type="search"
              placeholder="Try “daily loss rule” or “TF-82104”"
              className="h-12 w-full rounded-tf-md border border-border bg-surface pl-12 pr-28 text-sm text-foreground placeholder:text-muted-foreground hover:border-white/20"
            />
            <Button type="submit" size="sm" className="absolute right-1.5 top-1.5">Search</Button>
          </label>
          <div className="mt-4 flex max-w-full gap-1 overflow-x-auto rounded-tf-sm" aria-label="Filter search results">
            {resultTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilter(type)}
                aria-pressed={filter === type}
                className={`min-h-9 whitespace-nowrap rounded-tf-sm px-3 text-xs font-semibold ${
                  filter === type ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-white/[.04] hover:text-foreground"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </form>

        <div className="p-5">
          <p className="mb-3 text-xs font-medium text-muted-foreground">{visible.length} result{visible.length === 1 ? "" : "s"}</p>
          <div className="grid gap-3">
            {visible.map((result) => {
              const Icon = iconByType[result.type];
              return (
                <Link
                  key={result.id}
                  href={result.href}
                  className="group flex items-center gap-4 rounded-tf-lg border border-border bg-surface p-4 transition-colors hover:border-primary/50 hover:bg-primary/[.035]"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-tf-md bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold">{result.title}</h2>
                      <StatusBadge tone="primary" icon={false}>{result.type}</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
          {visible.length === 0 && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <FileQuestion className="mx-auto size-8 text-muted-foreground" />
                <h2 className="mt-4 text-lg">No matching results</h2>
                <p className="mt-2 text-sm text-muted-foreground">Try an account ID, challenge name, payout reference, or rule topic.</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
