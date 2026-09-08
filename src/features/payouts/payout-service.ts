"use server";

import { requireAdmin, requireUser } from "@/lib/authorization";

export async function requestPayout(accountId: string, amount: string, method: string) {
  const { supabase } = await requireUser();
  const numericAmount = amount.trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(numericAmount)) throw new Error("Enter a valid payout amount.");
  const { data, error } = await supabase.rpc("request_payout", { target_account_id: accountId, requested: numericAmount, payout_method: method });
  if (error) throw new Error(error.message.includes("exceeds") ? "Requested payout exceeds available eligible profit." : error.message);
  return data;
}

export async function adminSetPayoutStatus(id: string, status: string, reference?: string) {
  const { admin } = await requireAdmin();
  const { data, error } = await admin.rpc("admin_set_payout_status", { target_id: id, next_status: status, settlement_reference: reference ?? null });
  if (error) throw new Error(error.message);
  return data;
}

export async function getAdminPayouts() {
  const { admin } = await requireAdmin();
  const { data, error } = await admin.from("payout_requests").select("id, user_id, account_id, requested_amount, approved_amount, method, status, requested_at, processed_at, processing_reference").order("requested_at", { ascending: false });
  if (error) throw new Error("Unable to load payout requests.");
  return data ?? [];
}