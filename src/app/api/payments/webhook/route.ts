import { NextResponse } from "next/server";
import { activateVerifiedPayment, verifyWebhookSignature, type VerifiedPaymentEvent } from "@/features/payments/crypto-payment-service";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, request.headers.get("x-tradeforge-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: VerifiedPaymentEvent;
  try {
    event = JSON.parse(rawBody) as VerifiedPaymentEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  if (event.event_type !== "payment.confirmed") {
    return NextResponse.json({ error: "Unsupported event" }, { status: 400 });
  }

  try {
    await activateVerifiedPayment(event);
    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be verified.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}