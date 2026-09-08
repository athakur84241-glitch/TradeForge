import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type RuleEvaluation = {
  accountId: string;
  currentProfit: string;
  profitTarget: string;
  profitProgressPercent: string;
  dailyLossUsed: string;
  overallLossUsed: string;
  tradingDays: number;
  minimumTradingDays: number;
  breached: boolean;
  breachReason: string | null;
  passed: boolean;
  providerAvailable: boolean;
};

function percentValue(value: string | null) {
  const match = value?.match(/(\d+(?:\.\d+)?)\s*%/);
  return match ? match[1] : null;
}

export async function evaluateAccountRules(accountId: string): Promise<RuleEvaluation> {
  const admin = createSupabaseAdminClient();
  const { data: account, error } = await admin.from("accounts").select("id, starting_balance, pnl, provider_account_id, challenge_plan_id, status").eq("id", accountId).single();
  if (error || !account) throw new Error("Account not found.");
  const { data: plan, error: planError } = await admin.from("challenge_plans").select("profit_target, daily_loss, overall_loss, minimum_trading_days").eq("id", account.challenge_plan_id).single();
  if (planError || !plan) throw new Error("Challenge rules are unavailable.");
  const { data: metrics } = await admin.from("daily_account_metrics").select("daily_loss_used, overall_loss_used, trading_day, breach_type").eq("account_id", accountId);
  const currentProfit = String(account.pnl ?? "0");
  const targetPercent = percentValue(plan.profit_target) ?? "0";
  const dailyLimitPercent = percentValue(plan.daily_loss) ?? "0";
  const overallLimitPercent = percentValue(plan.overall_loss) ?? "0";
  const starting = Number(account.starting_balance ?? 0);
  const profit = Number(currentProfit);
  const target = starting * Number(targetPercent) / 100;
  const tradingDays = (metrics ?? []).filter((metric) => metric.trading_day).length;
  const breach = (metrics ?? []).find((metric) => metric.breach_type);
  const breached = Boolean(breach) || Number(metrics?.[0]?.daily_loss_used ?? 0) > starting * Number(dailyLimitPercent) / 100 || Number(metrics?.[0]?.overall_loss_used ?? 0) > starting * Number(overallLimitPercent) / 100;
  const passed = !breached && target > 0 && profit >= target && tradingDays >= (plan.minimum_trading_days ?? 0);
  const progress = target > 0 ? Math.max(0, Math.min(100, profit / target * 100)) : 0;
  return {
    accountId,
    currentProfit,
    profitTarget: String(target),
    profitProgressPercent: progress.toFixed(2),
    dailyLossUsed: String(metrics?.[0]?.daily_loss_used ?? "0"),
    overallLossUsed: String(metrics?.[0]?.overall_loss_used ?? "0"),
    tradingDays,
    minimumTradingDays: plan.minimum_trading_days ?? 0,
    breached,
    breachReason: breach?.breach_type ?? null,
    passed,
    providerAvailable: Boolean(account.provider_account_id),
  };
}

export async function syncAndEvaluateAccount(accountId: string) {
  const evaluation = await evaluateAccountRules(accountId);
  if (!evaluation.providerAvailable) return evaluation;
  const admin = createSupabaseAdminClient();
  const nextStatus = evaluation.breached ? "failed" : evaluation.passed ? "passed" : "active";
  await admin.from("accounts").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", accountId).eq("status", "active");
  return evaluation;
}