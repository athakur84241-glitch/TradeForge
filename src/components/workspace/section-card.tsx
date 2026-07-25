import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-tf-lg border border-border bg-card", className)}>
      {(title || description || action) && (
        <div className="flex flex-col justify-between gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center">
          <div>
            {title && <h2 className="text-base font-semibold">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn("p-5", contentClassName)}>{children}</div>
    </section>
  );
}
