import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const symbol = new URL(request.url).searchParams.get("symbol");
  if (symbol !== "XAUUSD") return NextResponse.json({ error: "Historical dataset unavailable for symbol." }, { status: 404 });
  try {
    const file = await readFile(path.join(process.cwd(), "data", "normalized", "xauusd-1d.json"), "utf8");
    return NextResponse.json(JSON.parse(file), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Historical dataset is not installed." }, { status: 404 });
  }
}