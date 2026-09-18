"use server";

import { requireAdmin } from "@/lib/authorization";
import { reconcileWalletPayment } from "@/features/payments/direct-wallet-service";

const pageSize = 25;
type ListInput = { page?: number; search?: string; status?: string };
function range(input: ListInput) { const page = Math.max(1, input.page ?? 1); return { page, from: (page - 1) * pageSize, to: page * pageSize - 1 }; }
function assertUuid(value: string) { if (!/^[0-9a-f-]{36}$/i.test(value)) throw new Error("Invalid record ID."); }

export async function getAdminOverview() {
  const { admin } = await requireAdmin();
  const tables = ["orders", "purchases", "accounts", "payout_requests", "profiles"] as const;
  const counts = await Promise.all(tables.map((table) => admin.from(table).select("id", { count: "exact", head: true })));
  const [orders, accounts, payouts] = await Promise.all([
    admin.from("orders").select("status").limit(1000),
    admin.from("accounts").select("status").limit(1000),
    admin.from("payout_requests").select("status").limit(1000),
  ]);
  const failure = [...counts, orders, accounts, payouts].find((result) => result.error);
  if (failure?.error) throw new Error("Unable to load administrator workspace.");
  const tally = (rows: Array<{ status: string }> | null | undefined) => rows?.reduce<Record<string, number>>((all, row) => ({ ...all, [row.status]: (all[row.status] ?? 0) + 1 }), {}) ?? {};
  return { totals: Object.fromEntries(tables.map((table, index) => [table, counts[index].count ?? 0])), orders: tally(orders.data), accounts: tally(accounts.data), payouts: tally(payouts.data) };
}

export async function getAdminOrders(input: ListInput = {}) {
  const { admin } = await requireAdmin(); const { page, from, to } = range(input);
  let query = admin.from("orders").select("id, user_id, challenge_plan_id, account_size, amount_cents, currency, status, payment_method, payment_network, payment_address, payment_token_address, expected_amount, expected_amount_atomic, detected_amount_atomic, detected_address, detected_network, transaction_hash, payment_transaction_hint, confirmation_count, verification_provider, verified_at, payment_expires_at, paid_at, failure_reason, created_at, updated_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (input.status) query = query.eq("status", input.status);
  if (input.search && /^[0-9a-f-]{36}$/i.test(input.search)) query = query.or(`id.eq.${input.search},user_id.eq.${input.search}`);
  const { data, error, count } = await query; if (error) throw new Error("Unable to load orders.");
  const ids = [...new Set((data ?? []).map((row) => row.challenge_plan_id))]; const plans = ids.length ? await admin.from("challenge_plans").select("id, name").in("id", ids) : { data: [], error: null };
  if (plans.error) throw new Error("Unable to load challenge plans."); const names = new Map((plans.data ?? []).map((plan) => [plan.id, plan.name]));
  return { rows: (data ?? []).map((row) => ({ ...row, plan_name: names.get(row.challenge_plan_id) ?? "Plan unavailable" })), page, pageSize, total: count ?? 0 };
}

export async function getAdminPayments(input: ListInput = {}) { return getAdminOrders(input); }

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

export async function getAdminAccounts(input: ListInput = {}) {
  const { admin } = await requireAdmin(); const { page, from, to } = range(input);
  let query = admin.from("accounts").select("id, user_id, purchase_id, challenge_plan_id, account_name, account_size, status, phase, starting_balance, balance, equity, pnl, pnl_percent, platform, provider_account_id, last_activity, created_at, updated_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (input.status) query = query.eq("status", input.status);
  if (input.search && /^[0-9a-f-]{36}$/i.test(input.search)) query = query.or(`id.eq.${input.search},user_id.eq.${input.search}`);
  const { data, error, count } = await query; if (error) throw new Error("Unable to load accounts."); return { rows: data ?? [], page, pageSize, total: count ?? 0 };
}

export async function getAdminPayouts(input: ListInput = {}) {
  const { admin } = await requireAdmin(); const { page, from, to } = range(input);
  let query = admin.from("payout_requests").select("id, user_id, account_id, requested_amount, approved_amount, method, status, note, requested_at, processed_at, processing_reference, updated_at", { count: "exact" }).order("requested_at", { ascending: false }).range(from, to);
  if (input.status) query = query.eq("status", input.status);
  if (input.search && /^[0-9a-f-]{36}$/i.test(input.search)) query = query.or(`id.eq.${input.search},user_id.eq.${input.search},account_id.eq.${input.search}`);
  const { data, error, count } = await query; if (error) throw new Error("Unable to load payout requests."); return { rows: data ?? [], page, pageSize, total: count ?? 0 };
}

export async function getAdminUsers(input: ListInput = {}) {
  const { admin } = await requireAdmin();

  const { page } = range(input);
  const search = input.search?.trim().toLowerCase();

  let users: Awaited<
    ReturnType<typeof admin.auth.admin.listUsers>
  >["data"]["users"] = [];

  let total = 0;

  if (search) {
    const perPage = 100;
    let currentPage = 1;

    while (true) {
      const result = await admin.auth.admin.listUsers({
        page: currentPage,
        perPage,
      });

      if (result.error) {
        throw new Error("Unable to load users.");
      }

      users = [...users, ...result.data.users];
      total = result.data.total ?? users.length;

      if (users.length >= total || result.data.users.length < perPage) {
        break;
      }

      currentPage += 1;
    }
  } else {
    const result = await admin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (result.error) {
      throw new Error("Unable to load users.");
    }

    users = result.data.users;
    total = result.data.total ?? users.length;
  }

  const ids = users.map((user) => user.id);

  const profiles = ids.length
    ? await admin
        .from("profiles")
        .select(
          "id, display_name, first_name, last_name, role, created_at"
        )
        .in("id", ids)
    : { data: [], error: null };

  if (profiles.error) {
    throw new Error("Unable to load user profiles.");
  }

  const profileMap = new Map(
    (profiles.data ?? []).map((profile) => [profile.id, profile])
  );

  const filteredUsers = search
    ? users.filter((user) => {
        const profile = profileMap.get(user.id);

        return (
          user.id.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          profile?.display_name?.toLowerCase().includes(search) ||
          profile?.first_name?.toLowerCase().includes(search) ||
          profile?.last_name?.toLowerCase().includes(search)
        );
      })
    : users;

  const rows = filteredUsers.map((user) => ({
    id: user.id,
    email: user.email ?? "Unavailable",
    created_at: user.created_at,
    last_sign_in_at: user.last_sign_in_at,
    profile: profileMap.get(user.id) ?? null,
  }));

  const paginatedRows = search
    ? rows.slice((page - 1) * pageSize, page * pageSize)
    : rows;

  return {
    rows: paginatedRows,
    page,
    pageSize,
    total: search ? rows.length : total,
  };
}

export async function getAdminAuditLogs(input: ListInput = {}) {
  const { admin } = await requireAdmin(); const { page, from, to } = range(input); const { data, error, count } = await admin.from("audit_logs").select("id, actor_id, action, entity_type, entity_id, metadata, created_at", { count: "exact" }).order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error("Unable to load audit logs."); return { rows: data ?? [], page, pageSize, total: count ?? 0 };
}

export async function getAdminOrder(id: string) {
  assertUuid(id);

  const { admin } = await requireAdmin();

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (orderError) {
    throw new Error("Unable to load order.");
  }

  if (!order) {
    return null;
  }

  const [purchaseResult, planResult] = await Promise.all([
    admin
      .from("purchases")
      .select(
        "id, user_id, order_id, challenge_plan_id, account_size, amount_cents, currency, status, purchased_at, created_at, updated_at"
      )
      .eq("order_id", order.id)
      .maybeSingle(),

    admin
      .from("challenge_plans")
      .select(
        "id, name, account_size, price_cents, currency, is_active"
      )
      .eq("id", order.challenge_plan_id)
      .maybeSingle(),
  ]);

  if (purchaseResult.error) {
    throw new Error("Unable to load purchase.");
  }

  if (planResult.error) {
    throw new Error("Unable to load challenge plan.");
  }

  let account = null;

  if (purchaseResult.data?.id) {
    const accountResult = await admin
      .from("accounts")
      .select(
        "id, user_id, purchase_id, challenge_plan_id, account_name, account_size, status, phase, starting_balance, balance, equity, pnl, pnl_percent, platform, provider_account_id, last_activity, created_at, updated_at"
      )
      .eq("purchase_id", purchaseResult.data.id)
      .maybeSingle();

    if (accountResult.error) {
      throw new Error("Unable to load provisioned account.");
    }

    account = accountResult.data;
  }

  return {
    ...order,
    purchase: purchaseResult.data ?? null,
    plan: planResult.data ?? null,
    account,
  };
}

export async function reconcileAdminPayment(orderId: string) {
  assertUuid(orderId); const { admin, user } = await requireAdmin(); const result = await reconcileWalletPayment(orderId);
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "payment_reconciliation_requested", entity_type: "order", entity_id: orderId, metadata: { result: result.status, reason: result.reason } }); return result;
}

export async function setChallengePlanActive(planId: string, isActive: boolean) {
  const { admin, user } = await requireAdmin();
  const { error } = await admin.from("challenge_plans").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", planId);
  if (error) throw new Error("Unable to update challenge plan.");
  await admin.from("audit_logs").insert({ actor_id: user.id, action: isActive ? "challenge_plan_enabled" : "challenge_plan_disabled", entity_type: "challenge_plan", entity_id: planId, metadata: { is_active: isActive } });
}

export async function getAdminUser(id: string) {
  assertUuid(id); const { admin } = await requireAdmin();
  const [user, profile, orders, accounts, payouts, audit] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from("profiles").select("*").eq("id", id).maybeSingle(),
    admin.from("orders").select("id, amount_cents, currency, status, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(25),
    admin.from("accounts").select("id, account_name, account_size, status, phase, platform, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(25),
    admin.from("payout_requests").select("id, account_id, requested_amount, status, requested_at").eq("user_id", id).order("requested_at", { ascending: false }).limit(25),
    admin.from("audit_logs").select("id, action, entity_type, entity_id, metadata, created_at").eq("actor_id", id).order("created_at", { ascending: false }).limit(25),
  ]);
  if (user.error || profile.error || orders.error || accounts.error || payouts.error || audit.error) throw new Error("Unable to load user details.");
  return { user: user.data.user, profile: profile.data, orders: orders.data ?? [], accounts: accounts.data ?? [], payouts: payouts.data ?? [], audit: audit.data ?? [] };
}

export async function getAdminAccount(id: string) {
  assertUuid(id); const { admin } = await requireAdmin();
  const { data, error } = await admin.from("accounts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load account."); return data;
}