import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getPaymentMethodConfig } from "@/features/payments/payment-config";
import { verifyPaymentOnChain } from "@/features/payments/blockchain-verifier";
import { requireUser } from "@/lib/authorization";

export type WalletReconciliationStatus = {
  status: "pending" | "confirmed" | "failed" | "expired" | "unavailable";
  reason: string;
  transactionHash?: string;
};

export async function reconcileWalletPayment(orderId: string): Promise<WalletReconciliationStatus> {
  const admin = createSupabaseAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("id, status, payment_method, payment_network, payment_address, payment_token_address, expected_amount_atomic, payment_reference, payment_expires_at, transaction_hash, payment_transaction_hint")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return { status: "failed", reason: "Order not found during reconciliation." };
  }

  if (order.status === "paid") {
    return { status: "confirmed", reason: "Payment has already been validated." };
  }

  if (order.status !== "payment_pending") {
    return { status: "failed", reason: `Order is not awaiting payment: ${order.status}.` };
  }

  if (order.payment_expires_at && new Date(order.payment_expires_at).getTime() <= Date.now()) {
    await admin.from("orders").update({ status: "expired", updated_at: new Date().toISOString() }).eq("id", order.id).eq("status", "payment_pending");
    return { status: "expired", reason: "Payment expired before a valid confirmed transaction was recorded." };
  }

  const method = order.payment_method;
  if (!method) {
    return { status: "pending", reason: "Payment instructions are still being prepared." };
  }

  const config = getPaymentMethodConfig(method);
  const transactionHash = order.transaction_hash ?? order.payment_transaction_hint;
  if (!transactionHash) return { status: "pending", reason: "Submit a transaction hash to begin server-side verification." };

  const verification = await verifyPaymentOnChain({
    method,
    expectedAmountAtomic: String(order.expected_amount_atomic),
    expectedAddress: order.payment_address,
    network: order.payment_network,
    transactionHash,
    tokenAddress: order.payment_token_address ?? undefined,
  });

  if (verification.status !== "confirmed") {
    return { status: verification.status, reason: verification.reason, transactionHash };
  }

  await markOrderConfirmed(order.id, {
    paymentMethod: method,
    paymentNetwork: order.payment_network,
    paymentAddress: order.payment_address,
    amountAtomic: verification.amountAtomic ?? "0",
    transactionHash,
    paymentReference: order.payment_reference,
    confirmationCount: verification.confirmations ?? 0,
    provider: verification.provider ?? "unknown",
    metadata: { asset: verification.asset ?? config.asset },
  });

  return { status: "confirmed", reason: verification.reason, transactionHash };
}

export async function submitTransactionHash(orderId: string, transactionHash: string) {
  const normalized = transactionHash.trim();
  if (!normalized || normalized.length > 256 || !/^[A-Za-z0-9:_-]+$/.test(normalized)) {
    throw new Error("Enter a valid transaction hash.");
  }

  const { user } = await requireUser();
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("orders")
    .update({ payment_transaction_hint: normalized, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "payment_pending");
  if (error) throw new Error("Unable to save the transaction hash.");
}

export async function markOrderConfirmed(orderId: string, verification: {
  paymentMethod: string;
  paymentNetwork: string;
  paymentAddress: string;
  amountAtomic: string;
  transactionHash: string;
  paymentReference: string;
  tokenAddress?: string | null;
  confirmationCount: number;
  provider: string;
  metadata: Record<string, unknown>;
}) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("activate_verified_crypto_payment", {
    target_order_id: orderId,
    verified_method: verification.paymentMethod,
    verified_network: verification.paymentNetwork,
    verified_address: verification.paymentAddress,
    verified_amount_atomic: verification.amountAtomic,
    verified_transaction_hash: verification.transactionHash,
    verified_payment_reference: verification.paymentReference,
    verified_confirmation_count: verification.confirmationCount,
    verified_provider: verification.provider,
    verified_metadata: verification.metadata,
  });

  if (error) throw new Error(error.message || "Payment verification failed.");
  return data;
}
