import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CircleAlert,
  CircleCheck,
  Goal,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { AccountOverview } from "@/features/accounts/account-service";
import type { ChallengePlan } from "./challenge-catalogue";
import { ChallengeModels } from "./challenge-models";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function ChallengesPage({
  challengeCatalogue,
  accounts,
}: {
  challengeCatalogue: ChallengePlan[];
  accounts: AccountOverview[];
}) {
  const active = accounts[0];

  const activeStatus = active
    ? String(active.status).toLowerCase()
    : null;

  const activeChallengeCount = accounts.filter(
    (account) => String(account.status).toLowerCase() === "active",
  ).length;

  const isFunded = activeStatus === "funded";

  const timelineSteps = active
    ? [
        {
          title: "Account provisioned",
          detail: "This evaluation account exists in TradeForge.",
          state: "complete",
        },
        {
          title: "Trading integration",
          detail:
            "Trading provider data is unavailable until the provider connection is configured.",
          state: "active",
        },
        {
          title: "Evaluation progress",
          detail:
            "Authoritative progress is unavailable without verified trading data.",
          state: "upcoming",
        },
        {
          title: "Funded account",
          detail: isFunded
            ? "This account is currently marked as funded."
            : "Available after the evaluation lifecycle is completed.",
          state: isFunded ? "complete" : "upcoming",
        },
      ]
    : [];

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Challenges"
        title="Active evaluations"
        description="Every objective, risk limit, and next requirement is visible before you make a trading decision."
        action={
          <Button asChild variant="outline">
            <Link href="/search?q=rules">
              Review challenge rules <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <section
        aria-label="Challenge status"
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Active challenges"
          value={String(activeChallengeCount)}
          detail="From account records"
          icon={TrendingUp}
          tone="primary"
          trend="flat"
          compact
        />

        <MetricCard
          label="Trading integration"
          value="Unavailable"
          detail="Provider configuration required"
          icon={Target}
          tone="warning"
          trend="flat"
          compact
        />

        <MetricCard
          label="Rule compliance"
          value="Unavailable"
          detail="Requires verified trading data"
          icon={ShieldCheck}
          tone="warning"
          trend="flat"
          compact
        />

        <MetricCard
          label="Trading days"
          value="Unavailable"
          detail="Provider configuration required"
          icon={CalendarDays}
          tone="warning"
          trend="flat"
          compact
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Current phase"
          description={
            active
              ? `${active.name} · ${active.id}`
              : "Purchase a challenge to create an evaluation account."
          }
          className="xl:col-span-8"
          action={
            active ? (
              <StatusBadge tone="primary">{active.status}</StatusBadge>
            ) : null
          }
        >
          {active ? (
            <div className="grid gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="primary">{active.phase}</StatusBadge>
                <span className="text-xs text-muted-foreground">
                  Account size {money(active.size)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  ["Current balance", "Unavailable"],
                  ["Current equity", "Unavailable"],
                  ["Current profit", "Unavailable"],
                  ["Trading data", "Unavailable"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-tf-md border border-border bg-surface p-4"
                  >
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-lg font-semibold">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3">
                {[
                  [
                    "Profit target",
                    "Unavailable",
                    "Challenge plan is not linked to this account.",
                  ],
                  [
                    "Daily loss rule",
                    "Unavailable",
                    "Challenge plan is not linked to this account.",
                  ],
                  [
                    "Overall loss rule",
                    "Unavailable",
                    "Challenge plan is not linked to this account.",
                  ],
                ].map(([label, value, detail]) => (
                  <div
                    key={label}
                    className="rounded-tf-md border border-border bg-surface p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold">{label}</p>
                      <p className="text-sm font-semibold">{value}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-3 rounded-tf-md border border-primary/20 bg-primary/10 p-4">
                <Goal className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Next milestone</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Trading provider integration is required before
                    authoritative progress and pass/fail evaluation can begin.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-tf-md border border-dashed border-border p-6 text-sm text-muted-foreground">
              No challenge accounts are available yet.
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Progress timeline"
          description="What has happened and what comes next."
          className="xl:col-span-4"
        >
          {active ? (
            <ol className="relative grid gap-0 before:absolute before:bottom-5 before:left-[17px] before:top-5 before:w-px before:bg-border">
              {timelineSteps.map((step) => (
                <li
                  key={step.title}
                  className="relative flex gap-3 pb-6 last:pb-0"
                >
                  <span
                    className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full border ${
                      step.state === "complete"
                        ? "border-success/30 bg-success/15 text-success"
                        : step.state === "active"
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border bg-surface text-muted-foreground"
                    }`}
                  >
                    {step.state === "complete" ? (
                      <CircleCheck className="size-4" />
                    ) : step.state === "active" ? (
                      <TrendingUp className="size-4" />
                    ) : (
                      <CircleAlert className="size-4" />
                    )}
                  </span>

                  <div className="pt-1">
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">
                      {step.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="rounded-tf-md border border-dashed border-border p-6 text-sm text-muted-foreground">
              No challenge progress is available yet.
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="All evaluations"
        description="Passed, failed, and active statuses are shown explicitly."
        contentClassName="p-0"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
              <tr>
                {[
                  "Evaluation",
                  "Phase",
                  "Account size",
                  "Profit",
                  "Trading days",
                  "Progress",
                  "Status",
                ].map((heading) => (
                  <th key={heading} className="px-5 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {accounts.map((account) => {
                const normalizedStatus = String(account.status).toLowerCase();

                return (
                  <tr
                    key={account.id}
                    className="border-b border-border/70 last:border-0 hover:bg-white/[.025]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">
                        {account.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {account.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {account.phase}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      {money(account.size)}
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      Unavailable
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      Unavailable
                    </td>

                    <td className="px-5 py-4 text-muted-foreground">
                      Unavailable
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge
                        tone={
                          normalizedStatus === "passed" ||
                          normalizedStatus === "funded"
                            ? "success"
                            : normalizedStatus === "failed"
                              ? "danger"
                              : "primary"
                        }
                      >
                        {account.status}
                      </StatusBadge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard
        title="Available challenge models"
        description="Compare account sizes and rules before selecting a demo model."
        contentClassName="p-0"
      >
        <ChallengeModels challengeModels={challengeCatalogue} />
      </SectionCard>
    </div>
  );
}