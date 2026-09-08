"use server";

import { requireAdmin } from "@/lib/authorization";

export async function getAdminSnapshot() {
  const { admin } = await requireAdmin();
  const [orders, purchases, accounts, payouts, plans] = await Promise.all([
    admin.from("orders").select("id, user_id, amount_cents, currency, status, payment_method, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("purchases").select("id, user_id, order_id, account_size, status, purchased_at").order("purchased_at", { ascending: false }).limit(50),
    admin.from("accounts").select("id, user_id, account_name, account_size, status, phase, platform, created_at").order("created_at", { ascending: false }).limit(50),
    admin.from("payout_requests").select("id, user_id, account_id, requested_amount, method, status, requested_at").order("requested_at", { ascending: false }).limit(50),
    admin.from("challenge_plans").select("id, name, account_size, price_cents, currency, is_active, sort_order").order("sort_order").order("account_size").limit(100),
  ]);
  const failure = [orders, purchases, accounts, payouts, plans].find((result) => result.error);
  if (failure?.error) throw new Error("Unable to load administrator workspace.");
  return { orders: orders.data ?? [], purchases: purchases.data ?? [], accounts: accounts.data ?? [], payouts: payouts.data ?? [], plans: plans.data ?? [] };
}

export async function setChallengePlanActive(planId: string, isActive: boolean) {
  const { admin, user } = await requireAdmin();
  const { error } = await admin.from("challenge_plans").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", planId);
  if (error) throw new Error("Unable to update challenge plan.");
  await admin.from("audit_logs").insert({ actor_id: user.id, action: isActive ? "challenge_plan_enabled" : "challenge_plan_disabled", entity_type: "challenge_plan", entity_id: planId, metadata: { is_active: isActive } });
}