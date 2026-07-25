import Link from "next/link";

export function TradeForgeBrand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="TradeForge dashboard home">
      <span className="grid size-9 shrink-0 place-items-center rounded-tf-sm bg-primary-solid font-display text-sm font-bold text-primary-solid-foreground shadow-glow">
        T
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block font-display text-base font-bold tracking-tight">TradeForge</span>
          <span className="block truncate text-xs text-muted-foreground">Institutional trading workspace</span>
        </span>
      )}
    </Link>
  );
}
