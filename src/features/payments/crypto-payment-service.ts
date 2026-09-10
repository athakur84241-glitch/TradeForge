import { createHmac, timingSafeEqual } from "node:crypto";

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
  void event;
  throw new Error("Legacy signed payment events are disabled; use direct-wallet blockchain reconciliation.");
}