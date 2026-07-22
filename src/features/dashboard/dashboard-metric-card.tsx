import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Metric } from "./types";

const toneStyles = {
  neutral: "text-muted-foreground",
  positive: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function DashboardMetricCard({ metric }: { metric: Metric }) {
  const Indicator = metric.tone === "positive" ? ArrowUpRight : metric.tone === "danger" ? ArrowDownRight : Minus;
  return <Card className="p-4 sm:p-5"><p className="text-sm text-muted-foreground">{metric.label}</p><div className="mt-3 flex items-end justify-between gap-3"><strong className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{metric.value}</strong><Indicator className={cn("mb-1 size-4 shrink-0", toneStyles[metric.tone])} aria-hidden="true" /></div><p className={cn("mt-2 text-xs font-medium", metric.tone === "neutral" ? "text-muted-foreground" : toneStyles[metric.tone])}>{metric.detail}</p></Card>;
}
