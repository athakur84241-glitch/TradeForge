import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/features/workspace/types";

const toneStyles: Record<Tone, string> = {
  neutral: "text-muted-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
  trend = "flat",
  compact = false,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: Tone;
  trend?: "up" | "down" | "flat";
  compact?: boolean;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <article className={cn("rounded-tf-lg border border-border bg-card", compact ? "p-4" : "p-5")}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid size-9 place-items-center rounded-tf-md bg-white/[.04]", toneStyles[tone])}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <TrendIcon className={cn("size-4", toneStyles[tone])} aria-hidden="true" />
      </div>
      <p className="mt-4 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>
      <p className={cn("mt-2 text-xs font-medium", toneStyles[tone])}>{detail}</p>
    </article>
  );
}
