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
import { activityFeed, recentTrades } from "@/features/workspace/mock-data";
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

export function DashboardPage() {
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
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
          }
          return;
        }

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
  const currentProfit = selectedAccount?.pnl ?? 0;
  const balance = selectedAccount?.balance ?? 0;
  const equity = selectedAccount?.equity ?? 0;
  const targetAmount = Math.max(6000, accountSize * 0.06);
  const targetRemaining = Math.max(0, targetAmount - currentProfit);
  const profitTargetProgress = clampPercent(selectedAccount?.pnlPercent ?? 0);
  const dailyDrawdownPercent = clampPercent(((accountSize - Math.min(balance, accountSize)) / Math.max(accountSize, 1)) * 100);
  const overallDrawdownPercent = clampPercent(((accountSize - Math.min(equity, accountSize)) / Math.max(accountSize, 1)) * 100);
  const tradingDaysValue = selectedAccount ? `${Math.min(10, Math.max(1, Math.round(Math.abs(selectedAccount.pnlPercent) * 10)))} / 10` : "0 / 10";

  const kpis = [
    { label: "Balance", value: money(balance), detail: selectedAccount ? `${selectedAccount.phase} account balance` : "+0.00% from start", icon: WalletCards, tone: "success" as const, trend: "up" as const },
    { label: "Equity", value: money(equity), detail: money(currentProfit) + " open PnL", icon: Landmark, tone: "primary" as const, trend: "up" as const },
    { label: "Current profit", value: `${currentProfit >= 0 ? "+" : ""}${money(currentProfit)}`, detail: `${profitTargetProgress.toFixed(0)}% of phase target`, icon: TrendingUp, tone: "success" as const, trend: "up" as const },
    { label: "Daily drawdown", value: formatPercent(dailyDrawdownPercent), detail: `${dailyDrawdownPercent.toFixed(1)}% limit used`, icon: Gauge, tone: "neutral" as const, trend: "flat" as const },
    { label: "Overall drawdown", value: formatPercent(overallDrawdownPercent), detail: `${overallDrawdownPercent.toFixed(1)}% limit used`, icon: ShieldCheck, tone: "neutral" as const, trend: "flat" as const },
    { label: "Profit target", value: `${profitTargetProgress.toFixed(0)}%`, detail: `${money(targetRemaining)} remaining`, icon: Target, tone: "warning" as const, trend: "up" as const },
    { label: "Trading days", value: tradingDaysValue, detail: "Selected account activity", icon: CalendarDays, tone: "success" as const, trend: "up" as const },
  ];
  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="Thursday, 24 July"
        title="Welcome back, Alex."
        description="Your Phase 2 evaluation is healthy. Protect the remaining risk budget while you work toward the next milestone."
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
          <PerformanceChart />
        </SectionCard>

        <SectionCard
          title="Risk overview"
          description="Limit usage and account compliance."
          className="xl:col-span-4"
          action={<StatusBadge tone={selectedAccount?.status === "Active" ? "success" : "primary"}>{selectedAccount?.status ?? "Active"}</StatusBadge>}
        >
          <div className="grid gap-6">
            <ProgressBar value={dailyDrawdownPercent} label="Daily loss usage" detail={`${money(Math.max(0, accountSize - Math.min(balance, accountSize)))} / ${money(accountSize)}`} tone="success" />
            <ProgressBar value={overallDrawdownPercent} label="Maximum drawdown usage" detail={`${money(Math.max(0, accountSize - Math.min(equity, accountSize)))} / ${money(accountSize)}`} tone="success" />
            <ProgressBar value={profitTargetProgress} label="Profit target progress" detail={`${money(currentProfit)} / ${money(targetAmount)}`} tone="primary" />
            <div className="rounded-tf-md border border-success/20 bg-success/10 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-success">
                <ShieldCheck className="size-4" /> Risk status: healthy
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selectedAccount ? `No active rule breaches for ${selectedAccount.name}. Daily and overall loss boundaries remain available.` : "No active rule breaches. Daily and overall loss boundaries have more than 70% capacity remaining."}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <SectionCard
          title="Active evaluation"
          description={selectedAccount ? `${selectedAccount.name} · ${selectedAccount.accountId}` : "Active evaluation"}
          className="xl:col-span-8"
          action={
            <Button asChild variant="outline" size="sm">
              <Link href="/challenges">Review rules <ArrowRight className="size-4" /></Link>
            </Button>
          }
        >
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="primary">{selectedAccount?.phase ?? "Phase 2"}</StatusBadge>
              <StatusBadge tone="success">{selectedAccount?.status ?? "Active"}</StatusBadge>
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
                  {selectedAccount ? `Maintain discipline for ${selectedAccount.name} and protect the remaining buffer.` : "Maintain discipline and protect the remaining buffer."}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Weekly performance" description="Current calendar week." className="xl:col-span-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Weekly PnL", "+$1,459", "text-success"],
              ["Win rate", "64.2%", "text-foreground"],
              ["Profit factor", "1.86", "text-foreground"],
              ["Average R:R", "1.68R", "text-foreground"],
              ["Best trading day", "+$612", "text-success"],
              ["Consistency", "82 / 100", "text-primary"],
            ].map(([label, value, className]) => (
              <div key={label} className="rounded-tf-md border border-border bg-surface p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`mt-2 font-display text-lg font-semibold ${className}`}>{value}</p>
              </div>
            ))}
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
                {recentTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-border/70 last:border-0 hover:bg-white/[.025]">
                    <td className="px-5 py-4 font-semibold text-foreground">{trade.symbol}</td>
                    <td className="px-5 py-4 text-muted-foreground">{trade.side}</td>
                    <td className="px-5 py-4 text-muted-foreground">{trade.closedAt}</td>
                    <td className="px-5 py-4 text-muted-foreground">{trade.duration}</td>
                    <td className="px-5 py-4 text-muted-foreground">{trade.riskReward.toFixed(1)}R</td>
                    <td className={`px-5 py-4 font-semibold ${trade.pnl >= 0 ? "text-success" : "text-danger"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{money(trade.pnl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Recent activity" description="Account, challenge, and payout events." className="xl:col-span-5">
          <div className="grid gap-1">
            {activityFeed.map((event) => (
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
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Net result", value: "+$4,260.80", icon: CircleDollarSign },
              { label: "Average trade", value: "+$86.96", icon: Scale },
              { label: "Trades closed", value: "49", icon: BarChart3 },
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
            Highest-quality sessions remain London open and the first hour of New York. Performance data is demo-only.
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
