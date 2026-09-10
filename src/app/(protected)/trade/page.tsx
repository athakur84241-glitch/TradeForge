import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TradingTerminal } from "@/features/trading/trading-terminal";

export const metadata: Metadata = { title: "Trading terminal" };

export default function TradePage() {
  return (
    <div className="grid gap-5">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to dashboard
      </Link>
      <TradingTerminal />
    </div>
  );
}