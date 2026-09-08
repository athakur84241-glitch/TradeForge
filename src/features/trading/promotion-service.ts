"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { requireUser } from "@/lib/authorization";

export async function promotePassedAccount(accountId: string) {
  const { user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { data: account, error } = await admin.from("accounts").select("id, user_id, status, phase, purchase_id, starting_balance, balance, equity").eq("id", accountId).eq("user_id", user.id).single();
  if (error || !account) throw new Error("Account not found.");
  if (account.status !== "passed") throw new Error("Only passed evaluations can be promoted.");
  const { data, error: updateError } = await admin.from("accounts").update({ status: "funded_pending_integration", phase: "Funded", platform: "Not connected", updated_at: new Date().toISOString() }).eq("id", account.id).eq("status", "passed").select("id, status, phase, platform").single();
  if (updateError || !data) throw new Error("Unable to promote account.");
  await admin.from("audit_logs").insert({ actor_id: user.id, action: "account_promoted", entity_type: "account", entity_id: account.id, metadata: { integration_status: "pending" } });
  return data;
}