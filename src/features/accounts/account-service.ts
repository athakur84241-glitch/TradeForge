"use server";

import { requireUser } from "@/lib/authorization";

export type AccountOverview = {
  id: string;
  purchaseId: string | null;
  name: string;
  size: number;
  phase: string;
  status: string;
  balance: string;
  equity: string;
  pnl: string;
  platform: string;
  createdAt: string;
};

export async function getUserAccountOverviews(): Promise<AccountOverview[]> {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from("accounts")
    .select(
      "id, purchase_id, account_name, account_size, phase, status, balance, equity, pnl, platform, created_at"
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error("Unable to load challenge accounts.");

  return (data ?? []).map((account) => ({
    id: account.id,
    purchaseId: account.purchase_id ?? null,
    name: account.account_name,
    size: account.account_size,
    phase: account.phase,
    status: account.status,
    balance: String(account.balance),
    equity: String(account.equity),
    pnl: String(account.pnl),
    platform: account.platform,
    createdAt: account.created_at,
  }));
}