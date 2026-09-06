import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ChallengeModel } from "@/features/workspace/types";

type ChallengePlanRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  account_size: number;
  price_cents: number;
  phases: number;
  profit_target: string;
  profit_split: number | null;
  daily_loss: string;
  overall_loss: string;
  minimum_trading_days: number | null;
  payout_frequency: string;
  trailing_drawdown: string | null;
  payout_eligibility: string | null;
  is_active: boolean;
  sort_order: number;
};

export type ChallengePlan = ChallengeModel & {
  planId: string;
  slug: string;
  accountSize: number;
  priceCents: number;
  currency: string;
  profitSplit: string;
  payoutFrequency: string;
  trailingDrawdown: string | null;
  payoutEligibility: string | null;
  pricesBySize: Record<number, number>;
};

function mapPlan(row: ChallengePlanRow): ChallengePlan {
  return {
    id: row.slug,
    planId: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    phases: row.phases,
    profitTarget: row.profit_target,
    profitSplit: row.profit_split === null ? "None" : `${row.profit_split}%`,
    dailyLossLimit: row.daily_loss,
    overallLossLimit: row.overall_loss,
    tradingDays: row.minimum_trading_days === 0 ? "None" : `${row.minimum_trading_days} minimum`,
    sizes: [row.account_size],
    recommended: row.sort_order === 1,
    accountSize: row.account_size,
    priceCents: row.price_cents,
    currency: "USD",
    payoutFrequency: row.payout_frequency,
    trailingDrawdown: row.trailing_drawdown,
    payoutEligibility: row.payout_eligibility,
    pricesBySize: { [row.account_size]: row.price_cents },
  };
}

const planSelect = "id, slug, name, description, account_size, price_cents, phases, profit_target, profit_split, daily_loss, overall_loss, minimum_trading_days, payout_frequency, trailing_drawdown, payout_eligibility, is_active, sort_order";

export async function getChallengeCatalogue(): Promise<ChallengePlan[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("challenge_plans")
    .select(planSelect)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("account_size", { ascending: true });

  if (error) throw new Error(`Failed to load challenge catalogue: ${error.message}`);

  const plans = (data as ChallengePlanRow[]).map(mapPlan);
  const grouped = new Map<string, ChallengePlan>();

  for (const plan of plans) {
    const existing = grouped.get(plan.slug);
    if (existing) {
      existing.sizes.push(plan.accountSize);
      existing.pricesBySize[plan.accountSize] = plan.priceCents;
    } else {
      grouped.set(plan.slug, plan);
    }
  }

  return [...grouped.values()];
}

export async function getChallengePlan(slug: string, accountSize: number): Promise<ChallengePlan | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("challenge_plans")
    .select(planSelect)
    .eq("slug", slug)
    .eq("account_size", accountSize)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load challenge plan: ${error.message}`);

  return data ? mapPlan(data as ChallengePlanRow) : null;
}

export async function getChallengePlanById(planId: string): Promise<ChallengePlan | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("challenge_plans")
    .select(planSelect)
    .eq("id", planId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(`Failed to load challenge plan: ${error.message}`);

  return data ? mapPlan(data as ChallengePlanRow) : null;
}