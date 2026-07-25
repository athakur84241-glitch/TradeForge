"use client";

import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { challengeModels } from "@/features/workspace/mock-data";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/workspace/status-badge";

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function ChallengeModels() {
  const [query, setQuery] = useState("");
  const [size, setSize] = useState("All sizes");
  const [selected, setSelected] = useState<string | null>(null);

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return challengeModels.filter((model) => {
      const queryMatch = !normalized || `${model.name} ${model.description}`.toLowerCase().includes(normalized);
      const sizeMatch = size === "All sizes" || model.sizes.includes(Number(size));
      return queryMatch && sizeMatch;
    });
  }, [query, size]);

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search challenge models</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            type="search"
            placeholder="Search challenge models"
            className="h-10 w-full rounded-tf-md border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground"
          />
        </label>
        <label>
          <span className="sr-only">Filter by account size</span>
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="h-10 min-w-48 rounded-tf-md border border-border bg-surface px-3 text-sm text-foreground"
          >
            <option>All sizes</option>
            {[10000, 25000, 50000, 100000, 200000].map((amount) => (
              <option key={amount} value={amount}>{money(amount)}</option>
            ))}
          </select>
        </label>
      </div>
      {visible.length ? (
        <div className="grid gap-4 p-5 lg:grid-cols-3">
          {visible.map((model) => (
            <article
              key={model.id}
              className={cn(
                "flex flex-col rounded-tf-lg border bg-surface p-5",
                model.recommended ? "border-primary/50" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-tf-md bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                {model.recommended && <StatusBadge tone="primary">Recommended</StatusBadge>}
              </div>
              <h3 className="mt-4 text-lg">{model.name}</h3>
              <p className="mt-2 min-h-10 text-sm leading-5 text-muted-foreground">{model.description}</p>
              <dl className="mt-5 grid gap-3 text-sm">
                {[
                  ["Phases", String(model.phases)],
                  ["Profit target", model.profitTarget],
                  ["Daily loss", model.dailyLossLimit],
                  ["Overall loss", model.overallLossLimit],
                  ["Trading days", model.tradingDays],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-b border-border/70 pb-2 last:border-0">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">
                Sizes: {model.sizes.map(money).join(" · ")}
              </p>
              <Button
                type="button"
                variant={model.recommended ? "primary" : "outline"}
                className="mt-5 w-full"
                onClick={() => setSelected(model.id)}
              >
                {selected === model.id ? "Demo selection saved" : "Review model"}
              </Button>
            </article>
          ))}
        </div>
      ) : (
        <div className="grid min-h-48 place-items-center p-6 text-center">
          <div>
            <p className="font-semibold">No challenge models match</p>
            <p className="mt-2 text-sm text-muted-foreground">Clear the search or choose a different account size.</p>
          </div>
        </div>
      )}
    </div>
  );
}
