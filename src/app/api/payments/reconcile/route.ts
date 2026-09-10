import { NextResponse } from "next/server";
import { requireUser } from "@/lib/authorization";
import { reconcileWalletPayment, submitTransactionHash } from "@/features/payments/direct-wallet-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const body = (await request.json()) as { orderId?: string; transactionHash?: string };
    if (!body.orderId) {
      return NextResponse.json({ error: "An orderId is required." }, { status: 400 });
    }

    if (body.transactionHash) await submitTransactionHash(body.orderId, body.transactionHash);
    const ownership = createSupabaseAdminClient();
    const { data: order } = await ownership.from("orders").select("id").eq("id", body.orderId).eq("user_id", user.id).maybeSingle();
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    const result = await reconcileWalletPayment(body.orderId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment reconciliation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { user } = await requireUser();
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) {
    return NextResponse.json({ error: "An orderId query parameter is required." }, { status: 400 });
  }

  const ownership = createSupabaseAdminClient();
  const { data: order } = await ownership.from("orders").select("id").eq("id", orderId).eq("user_id", user.id).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const result = await reconcileWalletPayment(orderId);
  return NextResponse.json(result, { status: 200 });
}
