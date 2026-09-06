"use server";

import { getChallengePlanById } from "@/features/challenges/challenge-catalogue";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export type PendingOrder = {
  id: string;
  challengePlanId: string;
  accountSize: number;
  amountCents: number;
  currency: string;
  status: "pending";
  createdAt: string;
};

export async function createPendingOrder(challengePlanId: string): Promise<PendingOrder> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw new Error(`Authentication failed: ${userError.message}`);
  if (!user) throw new Error("You must be logged in to create an order.");

  const plan = await getChallengePlanById(challengePlanId);
  if (!plan) throw new Error("The selected challenge plan is no longer available.");

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      challenge_plan_id: plan.planId,
      account_size: plan.accountSize,
      amount_cents: plan.priceCents,
      currency: plan.currency,
      status: "pending",
    })
    .select("id, challenge_plan_id, account_size, amount_cents, currency, status, created_at")
    .single();

  if (error) throw new Error(`Failed to create order: ${error.message}`);

  return {
    id: data.id,
    challengePlanId: data.challenge_plan_id,
    accountSize: data.account_size,
    amountCents: data.amount_cents,
    currency: data.currency,
    status: "pending",
    createdAt: data.created_at,
  };
}