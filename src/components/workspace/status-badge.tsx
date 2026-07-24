import { CheckCircle2, CircleAlert, Clock3, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/features/workspace/types";

const styles: Record<Tone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
};

export function StatusBadge({
  children,
  tone = "neutral",
  icon = true,
}: {
  children: React.ReactNode;
  tone?: Tone;
  icon?: boolean;
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : tone === "warning" ? CircleAlert : Clock3;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold", styles[tone])}>
      {icon && <Icon className="size-3.5" aria-hidden="true" />}
      {children}
    </span>
  );
}
