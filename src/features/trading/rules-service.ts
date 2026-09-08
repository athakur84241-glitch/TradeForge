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

const SCALE = 18n;
const SCALE_UNIT = 10n ** SCALE;

function scaled(value: string | number | null | undefined) {
  const [whole, fraction = ""] = String(value ?? "0").split(".");
  const normalized = fraction.replace(/[^0-9]/g, "").slice(0, Number(SCALE)).padEnd(Number(SCALE), "0");
  return BigInt(`${whole.replace(/[^0-9-]/g, "") || "0"}${normalized}`);
}

function percentLimit(startingBalance: bigint, percent: string) {
  return startingBalance * scaled(percent) / (100n * SCALE_UNIT);
}

function decimalFromScaled(value: bigint) {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const text = absolute.toString().padStart(Number(SCALE) + 1, "0");
  return `${negative ? "-" : ""}${text.slice(0, -Number(SCALE))}.${text.slice(-Number(SCALE)).replace(/0+$/, "") || "0"}`;
}

function ratioPercent(value: bigint, target: bigint) {
  if (target <= 0n) return "0.00";
  const basisPoints = value * 10000n / target;
  return `${basisPoints / 100n}.${(basisPoints % 100n).toString().padStart(2, "0")}`;
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
  const starting = scaled(account.starting_balance);
  const profit = scaled(currentProfit);
  const target = percentLimit(starting, targetPercent);
  const tradingDays = (metrics ?? []).filter((metric) => metric.trading_day).length;
  const breach = (metrics ?? []).find((metric) => metric.breach_type);
  const dailyLossUsed = (metrics ?? []).reduce((maximum, metric) => {
    const value = scaled(metric.daily_loss_used);
    return value > maximum ? value : maximum;
  }, 0n);
  const overallLossUsed = (metrics ?? []).reduce((maximum, metric) => {
    const value = scaled(metric.overall_loss_used);
    return value > maximum ? value : maximum;
  }, 0n);
  const breached = Boolean(breach) || dailyLossUsed > percentLimit(starting, dailyLimitPercent) || overallLossUsed > percentLimit(starting, overallLimitPercent);
  const passed = !breached && target > 0n && profit >= target && tradingDays >= (plan.minimum_trading_days ?? 0);
  return {
    accountId,
    currentProfit,
    profitTarget: decimalFromScaled(target),
    profitProgressPercent: ratioPercent(profit, target),
    dailyLossUsed: decimalFromScaled(dailyLossUsed),
    overallLossUsed: decimalFromScaled(overallLossUsed),
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
  const { data: changed } = await admin.from("accounts").update({ status: nextStatus, updated_at: new Date().toISOString() }).eq("id", accountId).eq("status", "active").select("user_id, status").maybeSingle();
  if (changed && nextStatus !== "active") {
    const action = nextStatus === "passed" ? "challenge_passed" : "challenge_failed";
    await admin.from("audit_logs").insert({ actor_id: changed.user_id, action, entity_type: "account", entity_id: accountId, metadata: { breach_reason: evaluation.breachReason } });
    await admin.from("notifications").insert({ user_id: changed.user_id, category: nextStatus === "passed" ? "Challenge" : "Rule alert", title: nextStatus === "passed" ? "Challenge passed" : "Challenge failed", description: nextStatus === "passed" ? "Your server-side challenge evaluation has passed." : `Your challenge failed: ${evaluation.breachReason ?? "a configured rule was breached"}.`, href: "/challenges" });
  }
  return evaluation;
}