import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";

export const metadata: Metadata = {
  title: "TradeForge | Premium Trading Challenges",
  description: "Premium trading terminal experience, transparent challenge rules, and the fastest path to funded capital.",
};

export default function Page() {
  return <HomePage />;
}
