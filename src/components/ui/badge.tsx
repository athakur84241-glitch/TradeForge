import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const variants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", { variants: { status: { success: "bg-success/15 text-success", failed: "bg-danger/15 text-danger", funded: "bg-primary/15 text-primary", phase1: "bg-warning/15 text-warning", phase2: "bg-sky-400/15 text-sky-300", verified: "bg-emerald-400/15 text-emerald-300" } }, defaultVariants: { status: "success" } });
export function Badge({ status, className, children }: VariantProps<typeof variants> & { className?: string; children: React.ReactNode }) { return <span className={cn(variants({ status }), className)}>{children}</span>; }
