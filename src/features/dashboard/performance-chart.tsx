"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { performanceData } from "@/features/workspace/mock-data";
import { cn } from "@/lib/utils";

const ranges = ["7D", "1M", "3M"] as const;
type Range = (typeof ranges)[number];

const sliceByRange: Record<Range, number> = {
  "7D": 7,
  "1M": performanceData.length,
  "3M": performanceData.length,
};

export function PerformanceChart() {
  const [range, setRange] = useState<Range>("1M");
  const points = performanceData.slice(-sliceByRange[range]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Balance vs equity</p>
          <p className="mt-1 text-xs text-muted-foreground">Realised balance and live account equity</p>
        </div>
        <div className="flex rounded-tf-sm border border-border bg-surface p-1" role="group" aria-label="Chart range">
          {ranges.map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setRange(item)}
              aria-pressed={range === item}
              className={cn(
                "min-h-8 rounded px-3 text-xs font-semibold transition-colors",
                range === item ? "bg-primary-solid text-primary-solid-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div
        className="financial-grid h-[300px] w-full rounded-tf-md border border-border/70 bg-background/40 p-2 sm:h-[340px]"
        role="img"
        aria-label="Balance and equity performance chart. Equity closes at 104,486 dollars and balance closes at 104,261 dollars."
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 18, right: 12, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.32} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(var(--border))" strokeOpacity={0.42} vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={["dataMin - 500", "dataMax + 500"]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(value: number) => `$${Math.round(value / 1000)}k`}
            />
            <Tooltip
              cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.55 }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                boxShadow: "0 12px 32px rgb(0 0 0 / .28)",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "6px" }}
              itemStyle={{ color: "hsl(var(--muted-foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              name="Equity"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#equity-fill)"
              activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(var(--success))" }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" /> Equity $104,486.20
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2 rounded-full bg-success" /> Balance $104,260.80
        </span>
      </div>
    </div>
  );
}
