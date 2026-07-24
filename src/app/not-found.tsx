import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <section className="max-w-lg rounded-tf-xl border border-border bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <FileQuestion className="size-6" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-primary">404</p>
        <h1 className="mt-2 text-2xl">Workspace route not found</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The requested page is not part of this TradeForge demo workspace.
        </p>
        <Button asChild className="mt-6">
          <Link href="/"><ArrowLeft className="size-4" /> Return to dashboard</Link>
        </Button>
      </section>
    </div>
  );
}
