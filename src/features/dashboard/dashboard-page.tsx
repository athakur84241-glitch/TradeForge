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
import { PerformanceChart } from "./performance-chart";

type DashboardAccount = {
  id: string;
  name: string;
  accountId: string;
  size: number;
  phase: Account["phase"];
  status: Account["status"];
  balance: number;
  equity: number;
  pnl: number;
  pnlPercent: number;
  platform: string;
};

type DashboardAccountRow = {
  id: string;
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

function getDashboardHeaderDate() {
  const today = new Date();
  return new Intl.DateTimeFormat("en", { weekday: "long", day: "numeric", month: "long" }).format(today);
}

function getDashboardHeaderDescription(selectedAccount: DashboardAccount | null) {
  if (!selectedAccount) {
    return "Create your first evaluation account.";
  }

  if (selectedAccount.phase === "Phase 1") {
    return `Your Phase 1 evaluation is healthy. ${selectedAccount.name}.`;
  }

  if (selectedAccount.phase === "Funded" || selectedAccount.status === "Funded") {
    return `Your funded account is healthy. ${selectedAccount.name}.`;
  }

  return `Your ${selectedAccount.phase} evaluation is healthy. ${selectedAccount.name}.`;
}

function getChartSeries(selectedAccount: DashboardAccount | null) {
  return [];
}

function getRecentActivity(selectedAccount: DashboardAccount | null) {
  if (!selectedAccount) {
    return [
      {
        id: "account-loading",
        title: "Account loaded",
        description: "No account is currently selected.",
        timestamp: "Live",
      },
    ];
  }

  return [
    {
      id: "account-loaded",
      title: "Account loaded",
      description: `${selectedAccount.name} is ready for review.`,
      timestamp: "Live",
    },
    {
      id: "balance-sync",
      title: "Balance synced",
      description: `${money(selectedAccount.balance)} is currently reflected for this account.`,
      timestamp: "Live",
    },
    {
      id: "equity-update",
      title: "Equity updated",
      description: `${money(selectedAccount.equity)} is the latest live equity value.`,
      timestamp: "Live",
    },
    {
      id: "phase-detected",
      title: "Current phase detected",
      description: selectedAccount.phase,
      timestamp: "Live",
    },
    {
      id: "status-verified",
      title: "Status verified",
      description: selectedAccount.status,
      timestamp: "Live",
    },
  ];
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
          .select("id, account_name, account_size, status, phase, balance, equity, pnl, pnl_percent, platform")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const mapped: DashboardAccount[] = (data ?? []).map((row: DashboardAccountRow) => ({
          id: row.id,
          name: row.account_name ?? "Evaluation account",
          accountId: row.id,
          size: Number(row.account_size ?? 0),
          phase: (row.phase as Account["phase"]) ?? "Phase 2",
          status: (row.status as Account["status"]) ?? "Active",
          balance: Number(row.balance ?? 0),
          equity: Number(row.equity ?? 0),
          pnl: Number(row.pnl ?? 0),
          pnlPercent: Number(row.pnl_percent ?? 0),
          platform: row.platform ?? "TradeLocker",
        }));

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

  const accountSize = selectedAccount?.size ?? 100000;
  const headerDate = getDashboardHeaderDate();
  const headerDescription = getDashboardHeaderDescription(selectedAccount);
  const chartSeries = getChartSeries(selectedAccount);
  const recentActivity = getRecentActivity(selectedAccount);
  const currentProfit = selectedAccount?.pnl ?? 0;
  const balance = selectedAccount?.balance ?? 0;
  const equity = selectedAccount?.equity ?? 0;
  const targetAmount = Math.max(6000, accountSize * 0.06);
  const targetRemaining = Math.max(0, targetAmount - currentProfit);
  const hasTradingActivity = Boolean(selectedAccount && (Math.abs(currentProfit) > 0 || selectedAccount.pnlPercent !== 0));
  const profitTargetProgress = hasTradingActivity ? clampPercent(selectedAccount?.pnlPercent ?? 0) : 0;
  const dailyDrawdownPercent = hasTradingActivity ? clampPercent(((accountSize - Math.min(balance, accountSize)) / Math.max(accountSize, 1)) * 100) : 0;
  const overallDrawdownPercent = hasTradingActivity ? clampPercent(((accountSize - Math.min(equity, accountSize)) / Math.max(accountSize, 1)) * 100) : 0;
  const tradingDaysValue = "—";

  const kpis = [
    { label: "Balance", value: selectedAccount ? money(balance) : "—", detail: selectedAccount ? `${selectedAccount.phase} account balance` : "No account selected", icon: WalletCards, tone: "success" as const, trend: "up" as const },
    { label: "Equity", value: selectedAccount ? money(equity) : "—", detail: selectedAccount ? `${money(currentProfit)} open PnL` : "No account selected", icon: Landmark, tone: "primary" as const, trend: "up" as const },
    { label: "Current profit", value: selectedAccount ? `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}` : "—", detail: selectedAccount ? `${profitTargetProgress.toFixed(0)}% of phase target` : "No account selected", icon: TrendingUp, tone: "success" as const, trend: "up" as const },
    { label: "Daily drawdown", value: selectedAccount ? formatPercent(dailyDrawdownPercent) : "—", detail: selectedAccount ? `${dailyDrawdownPercent.toFixed(1)}% limit used` : "No account selected", icon: Gauge, tone: "neutral" as const, trend: "flat" as const },
    { label: "Overall drawdown", value: selectedAccount ? formatPercent(overallDrawdownPercent) : "—", detail: selectedAccount ? `${overallDrawdownPercent.toFixed(1)}% limit used` : "No account selected", icon: ShieldCheck, tone: "neutral" as const, trend: "flat" as const },
    { label: "Profit target", value: selectedAccount ? `${profitTargetProgress.toFixed(2)}%` : "—", detail: selectedAccount ? `Target 6% · ${money(targetRemaining)} remaining` : "No account selected", icon: Target, tone: "warning" as const, trend: "up" as const },
    { label: "Trading days", value: tradingDaysValue, detail: selectedAccount ? "Selected account activity" : "No account selected", icon: CalendarDays, tone: "success" as const, trend: "up" as const },
  ];
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow={headerDate}
        title={`Welcome back, ${displayName}.`}
        description={headerDescription}
        action={
          <div className="flex items-center gap-2">
            <DemoAction confirmation="Demo platform opened">
              Open trading platform <ArrowRight className="size-4" />
            </DemoAction>
          </div>
        }
      />

      <section aria-label="Primary account metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4 2xl:grid-cols-7 [&>article:last-child]:col-span-2 2xl:[&>article:last-child]:col-span-1">
        {kpis.map((metric) => (
          <MetricCard key={metric.label} {...metric} compact />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Performance"
          description="Evaluation equity curve through the current session."
          className="xl:col-span-8"
          contentClassName="p-4 sm:p-5"
        >
          <PerformanceChart data={chartSeries} selectedAccount={selectedAccount} />
        </SectionCard>

        <SectionCard
          title="Risk overview"
          description="Limit usage and account compliance."
          className="xl:col-span-4"
          action={<StatusBadge tone={selectedAccount?.status === "Active" ? "success" : "primary"}>{selectedAccount?.status ?? "Active"}</StatusBadge>}
        >
          <div className="grid gap-6">
            <ProgressBar value={dailyDrawdownPercent} label="Daily loss usage" detail={selectedAccount ? `${money(Math.max(0, accountSize - Math.min(balance, accountSize)))} / ${money(accountSize)}` : "Awaiting account activity"} tone="success" />
            <ProgressBar value={overallDrawdownPercent} label="Maximum drawdown usage" detail={selectedAccount ? `${money(Math.max(0, accountSize - Math.min(equity, accountSize)))} / ${money(accountSize)}` : "Awaiting account activity"} tone="success" />
            <ProgressBar value={profitTargetProgress} label="Profit target progress" detail={selectedAccount ? `${money(currentProfit)} / ${money(targetAmount)}` : "Awaiting account activity"} tone="primary" />
            <div className="rounded-tf-md border border-success/20 bg-success/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <ShieldCheck className="size-4" /> Risk status: healthy
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedAccount ? `No active rule breaches for ${selectedAccount.name}. Daily and overall loss boundaries remain available.` : "No active rule breaches. Daily and overall loss boundaries have more than 70% capacity remaining."}
              </p>
              <div className="mt-3 grid gap-2 border-t border-success/10 pt-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Daily reset timer</span>
                  <span>Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Server status</span>
                  <span>Stable</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Market session</span>
                  <span>Open</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance score</span>
                  <span>100%</span>
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
                <span className="text-xs text-muted-foreground">Last sync 2 minutes ago</span>
              </div>
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {[
                  ["Account size", money(accountSize)],
                  ["Current balance", money(balance)],
                  ["Current profit", `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}`],
                  ["Remaining target", money(targetRemaining)],
                  ["Daily loss limit", money(accountSize * 0.05)],
                  ["Overall limit", money(accountSize * 0.1)],
                  ["Trading days", tradingDaysValue],
                  ["Progress", `${profitTargetProgress.toFixed(0)}%`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-tf-md border border-border bg-surface p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-2 font-display text-base font-semibold">{value}</p>
                  </div>
                ))}
              </div>
              <ProgressBar
                value={profitTargetProgress}
                label="Phase progress"
                detail={`${money(targetRemaining)} remaining`}
              />
              <div className="flex items-start gap-3 rounded-tf-md border border-primary/20 bg-primary/10 p-4">
                <Goal className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Expected next milestone</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {`Maintain discipline for ${selectedAccount.name} and protect the remaining buffer.`}
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
            <div className="w-full max-w-[220px] text-center">
              <div className="mx-auto flex w-full max-w-[140px] items-end justify-center gap-2">
                <span className="h-8 w-3 rounded-full bg-primary/20" />
                <span className="h-10 w-3 rounded-full bg-primary/40" />
                <span className="h-6 w-3 rounded-full bg-primary/20" />
              </div>
              <p className="mt-4 text-sm font-semibold text-foreground">No trading activity this week</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Weekly analytics will appear after your first closed trade.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Recent trades"
          description="Latest closed positions on TF-82104."
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
            {recentActivity.map((event) => (
              <div key={event.id} className="flex gap-3 border-b border-border/70 py-3 first:pt-0 last:border-0 last:pb-0">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <Activity className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium">{event.title}</p>
                    <time className="text-xs text-muted-foreground">{event.timestamp}</time>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Performance summary" description="Decision-ready account statistics.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Balance", value: selectedAccount ? money(balance) : "—", icon: CircleDollarSign },
              { label: "Equity", value: selectedAccount ? money(equity) : "—", icon: Scale },
              { label: "PnL", value: selectedAccount ? `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}` : "—", icon: BarChart3 },
              { label: "PnL %", value: selectedAccount ? `${profitTargetProgress.toFixed(2)}%` : "—", icon: TrendingUp },
              { label: "Account size", value: selectedAccount ? money(accountSize) : "—", icon: Landmark },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-tf-md border border-border bg-surface p-4">
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
            {selectedAccount ? `Live account metrics for ${selectedAccount.name} are displayed here.` : "Performance metrics will appear after your first evaluation account is created."}
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
