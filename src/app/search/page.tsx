import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchWorkspace } from "@/features/search/search-workspace";

export const metadata: Metadata = {
  title: "Search",
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-64 animate-pulse rounded-tf-lg border border-border bg-card" />}>
      <SearchWorkspace />
    </Suspense>
  );
}
