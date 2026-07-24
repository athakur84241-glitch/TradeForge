import { cn } from "@/lib/utils";
import type { Tone } from "@/features/workspace/types";

const fills: Record<Tone, string> = {
  neutral: "bg-muted-foreground",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  label,
  detail,
  tone = "primary",
}: {
  value: number;
  label: string;
  detail: string;
  tone?: Tone;
}) {
  const bounded = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{detail}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(bounded)}
      >
        <div className={cn("h-full rounded-full transition-[width] duration-300", fills[tone])} style={{ width: `${bounded}%` }} />
      </div>
    </div>
  );
}
