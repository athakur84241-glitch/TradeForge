"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PAYMENT_METHOD_ASSETS, PAYMENT_METHODS, type PaymentMethod, getConfiguredTokenAddress, getPaymentMethodConfig, calculateExpectedAmount, getPaymentQrPayload } from "@/features/payments/payment-config";
import { reconcileWalletPayment } from "@/features/payments/direct-wallet-service";
import { submitTransactionHash } from "@/features/payments/direct-wallet-service";

type OrderRow = {
  id: string;
  challenge_plan_id: string;
  account_size: number;
  amount_cents: number;
  currency: string;
  status: PendingOrder["status"];
  created_at: string;
};

export type PendingOrder = {
  id: string;
  challengePlanId: string;
  accountSize: number;
  amountCents: number;
  currency: string;
  status: "pending" | "payment_pending" | "paid" | "failed" | "cancelled" | "expired";
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

  const { data: rawData, error } = await supabase
    .rpc("create_pending_order", { plan_id: challengePlanId })
    .single();

  if (error) throw new Error(`Failed to create order: ${error.message}`);
  const data = rawData as OrderRow;

  return {
    id: data.id,
    challengePlanId: data.challenge_plan_id,
    accountSize: data.account_size,
    amountCents: data.amount_cents,
    currency: data.currency,
    status: data.status,
    createdAt: data.created_at,
  };
}

export type PaymentRequest = PendingOrder & {
  paymentMethod: string;
  asset: string;
  network: string;
  address: string;
  expectedAmount: string;
  paymentReference: string;
  qrPayload: string;
  expiresAt: string;
};

export async function createCryptoPaymentRequest(orderId: string, method: string): Promise<PaymentRequest> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in to create a payment request.");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, user_id, challenge_plan_id, account_size, amount_cents, currency, status, created_at, payment_method, payment_network, payment_address, payment_token_address, expected_amount, expected_amount_atomic, payment_reference, payment_expires_at")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();
  if (orderError || !order) throw new Error("Order not found.");

  if (!PAYMENT_METHODS.includes(method as PaymentMethod)) throw new Error("Unsupported payment method.");
  const typedMethod = method as PaymentMethod;
  const admin = createSupabaseAdminClient();
  const now = Date.now();
  const expiresAt = new Date(now + 30 * 60 * 1000).toISOString();
  const isReusable = order.status === "payment_pending" && order.payment_method === typedMethod
    && order.payment_expires_at && new Date(order.payment_expires_at).getTime() > now;

  if (order.status !== "pending" && !isReusable) {
    throw new Error("This order is no longer available for payment.");
  }

  const config = getPaymentMethodConfig(typedMethod);
  const expected = isReusable
    ? { amount: order.expected_amount, atomic: order.expected_amount_atomic }
    : calculateExpectedAmount(order.amount_cents, config);
  const paymentReference = isReusable ? order.payment_reference : crypto.randomUUID();
  const paymentAddress = isReusable ? order.payment_address : config.address;
  const paymentNetwork = isReusable ? order.payment_network : config.network;
  const paymentTokenAddress = isReusable ? order.payment_token_address : getConfiguredTokenAddress(config) ?? null;
  const paymentExpiresAt = isReusable ? order.payment_expires_at : expiresAt;
  const qrPayload = getPaymentQrPayload(paymentAddress, expected.amount, typedMethod);

  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update({
      status: "payment_pending",
      payment_provider: "direct_wallet",
      payment_method: typedMethod,
      payment_network: paymentNetwork,
      payment_address: paymentAddress,
      payment_token_address: paymentTokenAddress,
      expected_amount: expected.amount,
      expected_amount_atomic: expected.atomic,
      exchange_rate: config.rateUsd,
      rate_timestamp: new Date().toISOString(),
      payment_reference: paymentReference,
      payment_expires_at: paymentExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("user_id", user.id)
    .select("id, challenge_plan_id, account_size, amount_cents, currency, status, created_at, payment_method, payment_network, payment_address, expected_amount, payment_reference, payment_expires_at")
    .single();
  if (updateError || !updated) throw new Error("Unable to create payment request.");

  return {
    id: updated.id,
    challengePlanId: updated.challenge_plan_id,
    accountSize: updated.account_size,
    amountCents: updated.amount_cents,
    currency: updated.currency,
    status: updated.status,
    createdAt: updated.created_at,
    paymentMethod: updated.payment_method,
    asset: PAYMENT_METHOD_ASSETS[typedMethod],
    network: updated.payment_network,
    address: updated.payment_address,
    expectedAmount: updated.expected_amount,
    paymentReference: updated.payment_reference,
    qrPayload: qrPayload,
    expiresAt: updated.payment_expires_at,
  };
}

export async function getOrderPaymentStatus(orderId: string): Promise<Pick<PendingOrder, "id" | "status"> & { expiresAt: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to view this order.");
  const { data, error } = await supabase.from("orders").select("id, status, payment_expires_at").eq("id", orderId).eq("user_id", user.id).single();
  if (error || !data) throw new Error("Order not found.");

  const status = await reconcileWalletPayment(data.id);
  if (status.status === "expired" && data.status === "payment_pending") {
    const admin = createSupabaseAdminClient();
    await admin.from("orders").update({ status: "expired", updated_at: new Date().toISOString() }).eq("id", data.id).eq("status", "payment_pending");
  }

  return {
    id: data.id,
    status: status.status === "confirmed" ? "paid" : status.status === "expired" ? "expired" : data.status,
    expiresAt: data.payment_expires_at,
  };
}

export async function cancelOrder(orderId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw new Error("You must be logged in to cancel an order.");
  const { data, error } = await supabase.rpc("cancel_user_order", { target_order_id: orderId });
  if (error || !data) throw new Error("This order cannot be cancelled.");
  return data;
}

export async function getUserOrders(): Promise<PendingOrder[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to view orders.");
  const { data, error } = await supabase
    .from("orders")
    .select("id, challenge_plan_id, account_size, amount_cents, currency, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Unable to load orders.");
  return (data ?? []).map((order) => ({
    id: order.id,
    challengePlanId: order.challenge_plan_id,
    accountSize: order.account_size,
    amountCents: order.amount_cents,
    currency: order.currency,
    status: order.status,
    createdAt: order.created_at,
  }));
}

export type Purchase = {
  id: string;
  orderId: string;
  challengePlanId: string;
  accountSize: number;
  amountCents: number;
  currency: string;
  status: "active" | "cancelled";
  purchasedAt: string;
};

export async function getUserPurchases(): Promise<Purchase[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be logged in to view purchases.");
  const { data, error } = await supabase
    .from("purchases")
    .select("id, order_id, challenge_plan_id, account_size, amount_cents, currency, status, purchased_at")
    .eq("user_id", user.id)
    .order("purchased_at", { ascending: false });
  if (error) throw new Error("Unable to load purchases.");
  return (data ?? []).map((purchase) => ({
    id: purchase.id,
    orderId: purchase.order_id,
    challengePlanId: purchase.challenge_plan_id,
    accountSize: purchase.account_size,
    amountCents: purchase.amount_cents,
    currency: purchase.currency,
    status: purchase.status,
    purchasedAt: purchase.purchased_at,
  }));
}

export async function checkOrderPayment(orderId: string, transactionHash?: string) {
  if (transactionHash) await submitTransactionHash(orderId, transactionHash);
  return getOrderPaymentStatus(orderId);
}