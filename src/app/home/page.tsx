import type { Metadata } from "next";
import { HomePage } from "@/components/public/home-page";
import { getChallengeCatalogue } from "@/features/challenges/challenge-catalogue";

export const metadata: Metadata = {
  title: "TradeForge | Premium Trading Challenges",
  description: "Premium trading terminal experience, transparent challenge rules, and the fastest path to funded capital.",
};

export default async function Page() {
  const challengeCatalogue = await getChallengeCatalogue();
  return <HomePage challengeCatalogue={challengeCatalogue} />;
}
