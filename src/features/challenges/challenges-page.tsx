import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import type { AccountOverview } from "@/features/accounts/account-service";
import type { ChallengePlan } from "./challenge-catalogue";
import { ChallengeModels } from "./challenge-models";

export function ChallengesPage({
  challengeCatalogue,
}: {
  challengeCatalogue: ChallengePlan[];
  accounts?: AccountOverview[];
}) {
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Challenges"
        title="Challenges"
        description="Choose an evaluation that fits your trading journey."
        action={
          <Button asChild variant="outline">
            <Link href="/search?q=rules">
              Review challenge rules <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <SectionCard
        title="Available challenge programmes"
        description="Choose a programme, account size, and the real challenge rules before you continue to checkout."
        contentClassName="p-0"
      >
        <ChallengeModels challengeModels={challengeCatalogue} />
      </SectionCard>
    </div>
  );
}