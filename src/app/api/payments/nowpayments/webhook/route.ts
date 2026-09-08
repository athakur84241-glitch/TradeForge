import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { PAYMENT_METHODS, type PaymentMethod } from "@/features/payments/payment-config";
import { activateVerifiedPayment } from "@/features/payments/crypto-payment-service";
import { decimalToAtomic, getNowPaymentsCurrency, isFailedNowPaymentsStatus, isSuccessfulNowPaymentsStatus, verifyNowPaymentsSignature, type NowPaymentsIpn } from "@/features/payments/nowpayments-service";

function methodForCurrency(currency: string) {
  return PAYMENT_METHODS.find((method) => getNowPaymentsCurrency(method) === currency) as PaymentMethod | undefined;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyNowPaymentsSignature(rawBody, request.headers.get("x-nowpayments-sig"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: NowPaymentsIpn;
  try {
    event = JSON.parse(rawBody) as NowPaymentsIpn;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (!event.order_id || !event.payment_id || !event.payment_status) {
    return NextResponse.json({ error: "Incomplete payment event" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, status, payment_provider, payment_method, payment_network, payment_address, expected_amount_atomic, payment_reference, payment_expires_at")
    .eq("id", event.order_id)
    .single();
  if (orderError || !order || order.payment_provider !== "nowpayments") {
    return NextResponse.json({ error: "Payment order not found" }, { status: 422 });
  }

  const paymentMethod = methodForCurrency(event.pay_currency ?? "");
  if (!paymentMethod || paymentMethod !== order.payment_method || order.payment_network !== event.pay_currency || order.payment_reference !== String(event.payment_id)) {
    return NextResponse.json({ error: "Payment does not match order" }, { status: 422 });
  }

  if (isFailedNowPaymentsStatus(event.payment_status)) {
    const nextStatus = event.payment_status === "expired" ? "expired" : "failed";
    if (order.status === "payment_pending") {
      await admin.from("orders").update({ status: nextStatus, failure_reason: `NOWPayments status: ${event.payment_status}`, updated_at: new Date().toISOString() }).eq("id", order.id).eq("status", "payment_pending");
    }
    return NextResponse.json({ received: true });
  }

  if (!isSuccessfulNowPaymentsStatus(event.payment_status)) {
    return NextResponse.json({ received: true });
  }
  if (order.status === "paid") return NextResponse.json({ received: true });
  if (order.status !== "payment_pending" || !event.pay_address || !event.pay_amount || !event.transaction_id) {
    return NextResponse.json({ error: "Payment is not ready for verification" }, { status: 422 });
  }
  if (order.payment_address !== event.pay_address) {
    return NextResponse.json({ error: "Payment destination does not match order" }, { status: 422 });
  }

  try {
    const decimals = paymentMethod === "SOL_SOLANA" ? 9 : 6;
    const amountAtomic = decimalToAtomic(event.actually_paid ?? event.pay_amount, decimals);
    if (BigInt(amountAtomic) < BigInt(order.expected_amount_atomic)) {
      return NextResponse.json({ error: "Payment amount is insufficient" }, { status: 422 });
    }
    await activateVerifiedPayment({
      event_type: "payment.confirmed",
      order_id: order.id,
      asset: paymentMethod.startsWith("USDC") ? "USDC" : paymentMethod.startsWith("USDT") ? "USDT" : "SOL",
      payment_method: paymentMethod,
      payment_network: event.pay_currency ?? "",
      payment_address: event.pay_address,
      amount_atomic: amountAtomic,
      transaction_hash: event.transaction_id,
      payment_reference: String(event.payment_id),
    });
  } catch {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 422 });
  }

  return NextResponse.json({ received: true });
}