import { createHmac, timingSafeEqual } from "node:crypto";
import { PAYMENT_METHOD_ASSETS, PAYMENT_METHODS } from "@/features/payments/payment-config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type VerifiedPaymentEvent = {
  event_type: "payment.confirmed";
  order_id: string;
  asset: string;
  payment_method: string;
  payment_network: string;
  payment_address: string;
  amount_atomic: string;
  transaction_hash: string;
  payment_reference: string;
};

export function verifyWebhookSignature(payload: string, signature: string | null) {
  const secret = process.env.CRYPTO_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const supplied = Buffer.from(signature, "utf8");
  const calculated = Buffer.from(expected, "utf8");
  return supplied.length === calculated.length && timingSafeEqual(supplied, calculated);
}

export async function activateVerifiedPayment(event: VerifiedPaymentEvent) {
  if (!PAYMENT_METHODS.includes(event.payment_method as (typeof PAYMENT_METHODS)[number])
    || PAYMENT_METHOD_ASSETS[event.payment_method as (typeof PAYMENT_METHODS)[number]] !== event.asset
    || !event.transaction_hash || !event.payment_reference || !/^\d+$/.test(event.amount_atomic)) {
    throw new Error("Invalid payment verification payload.");
  }
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc("activate_verified_crypto_payment", {
    target_order_id: event.order_id,
    verified_method: event.payment_method,
    verified_network: event.payment_network,
    verified_address: event.payment_address,
    verified_amount_atomic: event.amount_atomic,
    verified_transaction_hash: event.transaction_hash,
    verified_payment_reference: event.payment_reference,
  });
  if (error) throw new Error("Payment verification failed.");
  return data;
}