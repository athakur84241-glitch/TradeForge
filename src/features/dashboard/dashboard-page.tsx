"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Crosshair,
  Download,
  FileBarChart,
  Gauge,
  Goal,
  Landmark,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoAction } from "@/components/workspace/demo-action";
import { MetricCard } from "@/components/workspace/metric-card";
import { PageHeader } from "@/components/workspace/page-header";
import { ProgressBar } from "@/components/workspace/progress-bar";
import { SectionCard } from "@/components/workspace/section-card";
import { StatusBadge } from "@/components/workspace/status-badge";
import type { Account } from "@/features/workspace/types";
import { supabase } from "@/lib/supabase";

type DashboardChallengePlan = {
  profitTarget: number;
  dailyLossLimit: number;
  overallLossLimit: number;
  minimumTradingDays: number;
  payoutFrequency: string;
};

type DashboardAccount = {
  id: string;
  purchaseId: string | null;
  name: string;
  accountId: string;
  size: number;
  phase: Account["phase"];
  status: Account["status"];
  balance: number | null;
  equity: number | null;
  pnl: number | null;
  pnlPercent: number | null;
  platform: string;
  challengePlan: DashboardChallengePlan | null;
};

type DashboardAccountRow = {
  id: string;
  purchase_id: string | null;
  account_name: string | null;
  account_size: number | null;
  status: string | null;
  phase: string | null;
  balance: number | null;
  equity: number | null;
  pnl: number | null;
  pnl_percent: number | null;
  platform: string | null;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

function normalizeAccountStatus(status: string | null): Account["status"] {
  const normalized = status?.toLowerCase();
  if (normalized === "funded_pending_integration") return "Provisioning";
  if (normalized === "funded") return "Funded";
  if (normalized === "passed") return "Passed";
  if (normalized === "failed") return "Failed";
  if (normalized === "closed" || normalized === "archived") return "Archived";
  return "Active";
}

function getDashboardHeaderDate() {
  const today = new Date();
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(today);
}

function getDashboardHeaderDescription(selectedAccount: DashboardAccount | null) {
  if (!selectedAccount) {
    return "Create your first evaluation account.";
  }

  return selectedAccount.platform === "Not connected"
    ? `${selectedAccount.name} is awaiting a trading provider connection.`
    : `${selectedAccount.name} is ready for server-side account monitoring.`;
}



  
export function DashboardPage() {
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("User");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);

  useEffect(() => {
    function handleAccountSelection(event: Event) {
      const nextAccountId = (event as CustomEvent<{ accountId?: string | null }>).detail?.accountId ?? null;
      setSelectedAccountId(nextAccountId);
    }

    window.addEventListener("tradeforge:account-selected", handleAccountSelection as EventListener);
    return () => window.removeEventListener("tradeforge:account-selected", handleAccountSelection as EventListener);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadAccounts() {
      setIsLoadingAccounts(true);

      try {
        const userRes = await supabase.auth.getUser();
        const user = userRes.data?.user;

        if (!user) {
          if (mounted) {
            setAccounts([]);
            setSelectedAccountId(null);
            setDisplayName("User");
          }
          return;
        }

        const fullName = typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name.trim()
          ? user.user_metadata.full_name.trim()
          : null;
        const emailPrefix = typeof user.email === "string" && user.email.includes("@")
          ? user.email.split("@")[0]
          : null;
        const resolvedDisplayName = fullName ?? emailPrefix ?? "User";

        const { data, error } = await supabase
          .from("accounts")
          .select("id, purchase_id, account_name, account_size, status, phase, balance, equity, pnl, pnl_percent, platform")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
const accountRows = (data ?? []) as DashboardAccountRow[];

const purchaseIds = accountRows
  .map((row) => row.purchase_id)
  .filter((id): id is string => Boolean(id));

const purchasesById = new Map<string, { order_id: string | null }>();

if (purchaseIds.length > 0) {
  const { data: purchases, error: purchasesError } = await supabase
    .from("purchases")
    .select("id, order_id")
    .in("id", purchaseIds);

  if (purchasesError) throw purchasesError;

  for (const purchase of purchases ?? []) {
    purchasesById.set(purchase.id, {
      order_id: purchase.order_id ?? null,
    });
  }
}

const orderIds = Array.from(purchasesById.values())
  .map((purchase) => purchase.order_id)
  .filter((id): id is string => Boolean(id));

const ordersById = new Map<string, { challenge_plan_id: string | null }>();

if (orderIds.length > 0) {
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("id, challenge_plan_id")
    .in("id", orderIds);

  if (ordersError) throw ordersError;

  for (const order of orders ?? []) {
    ordersById.set(order.id, {
      challenge_plan_id: order.challenge_plan_id ?? null,
    });
  }
}

const challengePlanIds = Array.from(ordersById.values())
  .map((order) => order.challenge_plan_id)
  .filter((id): id is string => Boolean(id));

const plansById = new Map<string, DashboardChallengePlan>();

if (challengePlanIds.length > 0) {
  const { data: plans, error: plansError } = await supabase
    .from("challenge_plans")
    .select(
      "id, profit_target, daily_loss_limit, overall_loss_limit, minimum_trading_days, payout_frequency"
    )
    .in("id", challengePlanIds);

  if (plansError) throw plansError;

  for (const plan of plans ?? []) {
    plansById.set(plan.id, {
      profitTarget: Number(plan.profit_target),
      dailyLossLimit: Number(plan.daily_loss_limit),
      overallLossLimit: Number(plan.overall_loss_limit),
      minimumTradingDays: Number(plan.minimum_trading_days),
      payoutFrequency: plan.payout_frequency,
    });
  }
}
        const mapped: DashboardAccount[] = accountRows.map((row) => {
  const purchase = row.purchase_id
    ? purchasesById.get(row.purchase_id)
    : null;

  const order = purchase?.order_id
    ? ordersById.get(purchase.order_id)
    : null;

  const challengePlan = order?.challenge_plan_id
    ? plansById.get(order.challenge_plan_id) ?? null
    : null;

  return {
    id: row.id,
    purchaseId: row.purchase_id ?? null,
    name: row.account_name ?? "Evaluation account",
    accountId: row.id,
    size: Number(row.account_size ?? 0),
    phase: (row.phase as Account["phase"]) ?? "Phase 2",
    status: normalizeAccountStatus(row.status),
    balance: row.balance,
    equity: row.equity,
    pnl: row.pnl,
    pnlPercent: row.pnl_percent,
    platform: row.platform ?? "Not connected",
    challengePlan,
  };
});
         

        if (mounted) {
          const accountOptions = mapped.map((account) => ({ id: String(account.id), name: account.name }));
          setAccounts(mapped);
          setDisplayName(resolvedDisplayName);
          setSelectedAccountId((current) => {
            const nextAccountId = current && mapped.some((account) => account.id === current) ? current : mapped[0]?.id ?? null;
            Promise.resolve().then(() => {
              window.dispatchEvent(new CustomEvent("tradeforge:accounts-updated", { detail: { accounts: accountOptions, selectedAccountId: nextAccountId } }));
            });
            return nextAccountId;
          });
        }
      } catch (error) {
        console.error("Failed to load dashboard accounts", error);
        if (mounted) {
          setAccounts([]);
          setSelectedAccountId(null);
          setDisplayName("User");
        }
      } finally {
        if (mounted) {
          setIsLoadingAccounts(false);
        }
      }
    }

    loadAccounts();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedAccount = accounts.find((account) => String(account.id) === String(selectedAccountId)) ?? accounts[0] ?? null;

 const accountSize = selectedAccount?.size ?? 0;
const headerDate = getDashboardHeaderDate();
const headerDescription = getDashboardHeaderDescription(selectedAccount);

const currentProfit = selectedAccount?.pnl ?? null;
const balance = selectedAccount?.balance ?? null;
const equity = selectedAccount?.equity ?? null;

const tradingAvailable =
  Boolean(selectedAccount?.purchaseId) &&
  Boolean(selectedAccount?.platform) &&
  selectedAccount?.platform !== "Not connected";

const challengePlan = selectedAccount?.challengePlan ?? null;

const targetAmount =
  challengePlan !== null
    ? accountSize * (challengePlan.profitTarget / 100)
    : null;

const targetRemaining =
  targetAmount !== null && currentProfit !== null
    ? Math.max(0, targetAmount - currentProfit)
    : null;

const hasTradingActivity =
  tradingAvailable &&
  selectedAccount !== null &&
  currentProfit !== null &&
  selectedAccount.pnlPercent !== null;

const profitTargetProgress =
  hasTradingActivity &&
  challengePlan !== null &&
  selectedAccount?.pnlPercent !== null
    ? clampPercent(
        (selectedAccount.pnlPercent / challengePlan.profitTarget) * 100
      )
    : null;

const dailyDrawdownPercent = null;
const overallDrawdownPercent = null;
const tradingDaysValue = null;
 const kpis = [
  {
    label: "Balance",
    value: tradingAvailable && balance !== null ? money(balance) : "Unavailable",
    detail:
      tradingAvailable
        ? `${selectedAccount?.phase} account balance`
        : "Trading provider not connected",
    icon: WalletCards,
    tone: "success" as const,
    trend: "flat" as const,
  },
  {
    label: "Equity",
    value: tradingAvailable && equity !== null ? money(equity) : "Unavailable",
    detail:
      tradingAvailable && currentProfit !== null
        ? `${money(currentProfit)} open PnL`
        : "Trading provider not connected",
    icon: Landmark,
    tone: "primary" as const,
    trend: "flat" as const,
  },
  {
    label: "Current profit",
    value:
      tradingAvailable && currentProfit !== null
        ? `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}`
        : "Unavailable",
    detail:
      profitTargetProgress !== null
        ? `${profitTargetProgress.toFixed(0)}% of challenge target`
        : "Trading provider not connected",
    icon: TrendingUp,
    tone: "success" as const,
    trend: "flat" as const,
  },
  {
    label: "Daily drawdown",
    value:
      dailyDrawdownPercent !== null
        ? formatPercent(dailyDrawdownPercent)
        : "Unavailable",
    detail:
      challengePlan !== null
        ? `Limit ${challengePlan.dailyLossLimit}%`
        : "Challenge plan unavailable",
    icon: Gauge,
    tone: "neutral" as const,
    trend: "flat" as const,
  },
  {
    label: "Overall drawdown",
    value:
      overallDrawdownPercent !== null
        ? formatPercent(overallDrawdownPercent)
        : "Unavailable",
    detail:
      challengePlan !== null
        ? `Limit ${challengePlan.overallLossLimit}%`
        : "Challenge plan unavailable",
    icon: ShieldCheck,
    tone: "neutral" as const,
    trend: "flat" as const,
  },
  {
    label: "Profit target",
    value:
      challengePlan !== null
        ? `${challengePlan.profitTarget}%`
        : "Unavailable",
    detail:
      targetRemaining !== null
        ? `${money(targetRemaining)} remaining`
        : "Trading provider not connected",
    icon: Target,
    tone: "warning" as const,
    trend: "flat" as const,
  },
  {
    label: "Trading days",
    value:
      challengePlan !== null
        ? `${challengePlan.minimumTradingDays} required`
        : "Unavailable",
    detail: tradingAvailable
      ? "Completed days unavailable"
      : "Trading provider not connected",
    icon: CalendarDays,
    tone: "warning" as const,
    trend: "flat" as const,
  },
];
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={headerDate}
        title={`Welcome back, ${displayName}.`}
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/trade">
              Open trading platform <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <section aria-label="Primary account metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7 [&>article:last-child]:col-span-2 2xl:[&>article:last-child]:col-span-1">
        {kpis.map((metric) => (
          <MetricCard key={metric.label} {...metric} compact />
        ))}
      </section>

      <div className="grid gap-6">
        <SectionCard
          title="Risk overview"
          description="Limit usage and account compliance."
          action={<StatusBadge tone={selectedAccount?.status === "Active" ? "success" : "primary"}>{selectedAccount?.status ?? "Active"}</StatusBadge>}
        >
          <div className="grid gap-6">
           <div className="grid gap-3">
  <div className="rounded-tf-md border border-border bg-surface p-4">
    <p className="text-xs text-muted-foreground">Daily loss usage</p>
    <p className="mt-2 font-display text-base font-semibold">
      Unavailable
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {challengePlan
        ? `Challenge limit: ${challengePlan.dailyLossLimit}%`
        : "Challenge plan unavailable"}
    </p>
  </div>

  <div className="rounded-tf-md border border-border bg-surface p-4">
    <p className="text-xs text-muted-foreground">Maximum drawdown usage</p>
    <p className="mt-2 font-display text-base font-semibold">
      Unavailable
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {challengePlan
        ? `Challenge limit: ${challengePlan.overallLossLimit}%`
        : "Challenge plan unavailable"}
    </p>
  </div>

  <div className="rounded-tf-md border border-border bg-surface p-4">
    <p className="text-xs text-muted-foreground">Profit target progress</p>
    <p className="mt-2 font-display text-base font-semibold">
      {profitTargetProgress !== null
        ? `${profitTargetProgress.toFixed(0)}%`
        : "Unavailable"}
    </p>
    <p className="mt-1 text-xs text-muted-foreground">
      {targetAmount !== null
        ? `Target: ${money(targetAmount)}`
        : "Trading provider not connected"}
    </p>
  </div>
</div>
            <div className="rounded-tf-md border border-success/20 bg-success/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-warning">
                <ShieldCheck className="size-4" /> Risk status: {tradingAvailable ? "pending sync" : "unavailable"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Rule compliance is unavailable until a trading provider is connected.
              </p>
              <div className="mt-3 grid gap-2 border-t border-success/10 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Daily reset timer</span>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Server status</span>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Market session</span>
                  <span>{tradingAvailable ? "Available" : "Unavailable"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance score</span>
                  <span>{tradingAvailable ? "Pending sync" : "Unavailable"}</span>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title={selectedAccount ? "Active evaluation" : "No Active Evaluation"}
          description={selectedAccount ? `${selectedAccount.name} · ${selectedAccount.accountId}` : "You haven't created an evaluation account yet."}
          className="xl:col-span-8"
          action={selectedAccount ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/challenges">Review rules <ArrowRight className="size-4" /></Link>
            </Button>
          ) : null}
        >
          {selectedAccount ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="primary">{selectedAccount.phase}</StatusBadge>
                <StatusBadge tone="success">{selectedAccount.status}</StatusBadge>
                <span className="text-xs text-muted-foreground">{tradingAvailable ? "Provider data connected" : "Awaiting provider connection"}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Account size", money(accountSize)],
                  [
  ["Account size", money(accountSize)],
  [
    "Current balance",
    tradingAvailable && balance !== null ? money(balance) : "Unavailable",
  ],
  [
    "Current profit",
    tradingAvailable && currentProfit !== null
      ? `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}`
      : "Unavailable",
  ],
  [
    "Remaining target",
    targetRemaining !== null ? money(targetRemaining) : "Unavailable",
  ],
  [
    "Daily loss limit",
    challengePlan !== null
      ? `${challengePlan.dailyLossLimit}%`
      : "Unavailable",
  ],
  [
    "Overall limit",
    challengePlan !== null
      ? `${challengePlan.overallLossLimit}%`
      : "Unavailable",
  ],
  [
    "Trading days",
    challengePlan !== null
      ? `${challengePlan.minimumTradingDays} required`
      : "Unavailable",
  ],
  [
    "Progress",
    profitTargetProgress !== null
      ? `${profitTargetProgress.toFixed(0)}%`
      : "Unavailable",
  ],
]
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-tf-md border border-border bg-surface p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-base font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-tf-md border border-dashed border-border bg-surface/80 p-4">
  <p className="text-sm font-semibold">Phase progress</p>
  <p className="mt-1 text-sm text-muted-foreground">
    {profitTargetProgress !== null
      ? `${profitTargetProgress.toFixed(0)}% complete`
      : "Unavailable until trading provider data is connected."}
  </p>
</div>
              <div className="flex items-start gap-3 rounded-tf-md border border-primary/20 bg-primary/10 p-4">
                <Goal className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Expected next milestone</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
  {tradingAvailable
    ? "Trading provider data is connected. Performance milestones will appear from verified account activity."
    : "Trading performance milestones will appear after a trading provider is connected."}
</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-tf-md border border-dashed border-border bg-surface/80 p-6 text-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" /> Create Evaluation
              </div>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Your evaluation statistics will appear here after your first account is created.</p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/accounts">Create Evaluation</Link>
              </Button>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Weekly performance" description="Current calendar week." className="xl:col-span-4">
          <div className="flex min-h-[180px] items-center justify-center rounded-tf-md border border-dashed border-border bg-surface/80 p-5">
  <div className="text-center">
    <p className="text-sm font-semibold text-foreground">
      Weekly performance unavailable
    </p>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">
      Verified closed-trade data will appear after trading integration is connected.
    </p>
  </div>
</div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Recent trades"
          description="Latest verified closed positions."
          className="xl:col-span-7"
          contentClassName="p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-border bg-white/[.02] text-xs text-muted-foreground">
                <tr>
                  {["Symbol", "Side", "Closed", "Duration", "R:R", "PnL"].map((heading) => (
                    <th key={heading} className="px-5 py-3 font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                    No trade history available yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="Account, challenge, and payout events." className="xl:col-span-5">
          <div className="grid gap-1">
            <div className="rounded-tf-md border border-dashed border-border bg-surface/80 p-5 text-center">
  <p className="text-sm font-semibold text-foreground">
    No recent activity
  </p>
  <p className="mt-2 text-sm leading-6 text-muted-foreground">
    Verified account, challenge, and payout events will appear here.
  </p>
</div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Performance summary" description="Decision-ready account statistics.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {[
    {
      label: "Balance",
      value:
        tradingAvailable && balance !== null
          ? money(balance)
          : "Unavailable",
      icon: CircleDollarSign,
    },
    {
      label: "Equity",
      value:
        tradingAvailable && equity !== null
          ? money(equity)
          : "Unavailable",
      icon: Scale,
    },
    {
      label: "PnL",
      value:
        tradingAvailable && currentProfit !== null
          ? `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}`
          : "Unavailable",
      icon: BarChart3,
    },
    {
      label: "PnL %",
      value:
        tradingAvailable && selectedAccount?.pnlPercent !== null
          ? `${selectedAccount.pnlPercent.toFixed(2)}%`
          : "Unavailable",
      icon: TrendingUp,
    },
    {
      label: "Account size",
      value: selectedAccount ? money(accountSize) : "—",
      icon: Landmark,
    },
  ].map(({ label, value, icon: Icon }) => (
    <div
      key={label}
      className="flex items-center gap-3 rounded-tf-md border border-border bg-surface p-4"
    >
      <Icon className="size-5 shrink-0 text-primary" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </div>
    </div>
  ))}
</div>
          <p className="mt-4 flex items-start gap-2 rounded-tf-md bg-white/[.025] p-3 text-sm leading-6 text-muted-foreground">
            <Crosshair className="mt-1 size-4 shrink-0 text-primary" />
            {selectedAccount
  ? tradingAvailable
    ? `Verified provider metrics for ${selectedAccount.name} are displayed here.`
    : `Provider metrics for ${selectedAccount.name} are unavailable until trading integration is connected.`
  : "Performance metrics will appear after your first evaluation account is created."}
          </p>
        </SectionCard>

        <SectionCard title="Quick actions" description="Useful workspace shortcuts. Demo actions are labelled.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" className="justify-start">
              <Link href="/accounts"><Landmark className="size-4" /> View account</Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/challenges"><ShieldCheck className="size-4" /> Review rules</Link>
            </Button>
            <DemoAction variant="outline" className="justify-start" confirmation="Demo statement ready">
              <Download className="size-4" /> Download statement
            </DemoAction>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/payouts"><CircleDollarSign className="size-4" /> View payout eligibility</Link>
            </Button>
            <DemoAction variant="outline" className="justify-start sm:col-span-2" confirmation="Demo report opened">
              <FileBarChart className="size-4" /> Open performance report
            </DemoAction>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
