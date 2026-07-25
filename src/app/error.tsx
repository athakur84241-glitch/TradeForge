"use client";

import { CircleAlert, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <section className="max-w-lg rounded-tf-xl border border-danger/30 bg-card p-8 text-center shadow-card">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger/15 text-danger">
          <CircleAlert className="size-6" />
        </span>
        <h1 className="mt-5 text-2xl">This workspace view could not load</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {error.message || "An unexpected demo workspace error occurred. Retry the view to continue."}
        </p>
        <Button type="button" className="mt-6" onClick={reset}>
          <RotateCcw className="size-4" /> Retry view
        </Button>
      </section>
    </div>
  );
}
