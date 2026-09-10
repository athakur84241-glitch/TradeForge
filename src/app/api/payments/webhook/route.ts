import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await request.body?.cancel();
  return NextResponse.json(
    { error: "Generic payment webhooks are disabled. Submit a transaction hash to the direct-wallet reconciliation endpoint." },
    { status: 410 },
  );
}