import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import { getChallengePlan } from "@/features/challenges/challenge-catalogue";

type PageProps = {
  params: Promise<{
    modelId: string;
    size: string;
  }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { modelId, size } = await params;
  const model = await getChallengePlan(modelId, Number(size));

  return {
    title: model ? `${model.name} · $${Number(size).toLocaleString()}` : "Challenge",
  };
}

export default async function Page({ params }: PageProps) {
  const { modelId, size } = await params;

  const accountSize = Number(size);
  const model = await getChallengePlan(modelId, accountSize);

  if (!model) {
    notFound();
  }

  return (
    <div className="grid gap-6">
      <div>
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to challenges
        </Link>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Challenge model
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">
              {model.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              {model.description}
            </p>
          </div>

          {model.recommended && (
            <StatusBadge tone="primary">Recommended</StatusBadge>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Selected evaluation"
          description="Review the model before continuing."
          className="xl:col-span-8"
        >
          <div className="grid gap-5">
            <div className="flex items-center gap-3 rounded-tf-md border border-primary/20 bg-primary/10 p-4">
              <span className="grid size-10 place-items-center rounded-full bg-primary/15 text-primary">
                <ShieldCheck className="size-5" />
              </span>

              <div>
                <p className="text-sm font-semibold">
                  ${accountSize.toLocaleString()} evaluation
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {model.phases} phase{model.phases > 1 ? "s" : ""} ·{" "}
                  {model.tradingDays}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["Profit target", model.profitTarget],
                ["Daily loss limit", model.dailyLossLimit],
                ["Overall loss limit", model.overallLossLimit],
                ["Trading days", model.tradingDays],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-tf-md border border-border bg-surface p-4"
                >
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-2 font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-semibold">What you get</p>

              {[
                "Clear evaluation objectives",
                "Transparent risk limits",
                "Visible challenge progress",
                "Rule-based evaluation tracking",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Ready to continue?"
          description="This is the selected model and account size."
          className="xl:col-span-4"
        >
          <div className="grid gap-4">
            <div className="rounded-tf-md border border-border bg-surface p-4">
              <p className="text-xs text-muted-foreground">Account size</p>
              <p className="mt-2 font-display text-2xl font-semibold">
                ${accountSize.toLocaleString()}
              </p>
            </div>

         <Button asChild className="w-full" size="lg">
  <Link href={`/checkout/${model.id}/${accountSize}`}>
    Continue to checkout
  </Link>
</Button>
            <p className="text-center text-xs leading-5 text-muted-foreground">
              Checkout and payment will be connected in the next step.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}