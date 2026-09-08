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