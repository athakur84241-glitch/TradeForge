import type { Metadata } from "next";
import { ChallengesPage } from "@/features/challenges/challenges-page";
import { getChallengeCatalogue } from "@/features/challenges/challenge-catalogue";
import { getUserAccountOverviews } from "@/features/accounts/account-service";

export const metadata: Metadata = {
  title: "Challenges",
};

export default async function Page() {
  const challengeCatalogue = await getChallengeCatalogue();
  const accounts = await getUserAccountOverviews();
  return <ChallengesPage challengeCatalogue={challengeCatalogue} accounts={accounts} />;
}
