import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.body?.cancel();
  return NextResponse.json(
    { error: "NOWPayments webhooks are disabled. Use direct-wallet reconciliation with a transaction hash." },
    { status: 410 },
  );
}