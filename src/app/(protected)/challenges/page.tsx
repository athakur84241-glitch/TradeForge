import type { Metadata } from "next";
import { ChallengesPage } from "@/features/challenges/challenges-page";
import { getChallengeCatalogue } from "@/features/challenges/challenge-catalogue";

export const metadata: Metadata = {
  title: "Challenges",
};

export default async function Page() {
  const challengeCatalogue = await getChallengeCatalogue();
  return <ChallengesPage challengeCatalogue={challengeCatalogue} />;
}
