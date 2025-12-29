import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd",
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("price fetch failed");

    const data = await res.json();

    return NextResponse.json({
      price_USDT: data.shardeum.usd,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "price api failed" },
      { status: 500 }
    );
  }
}
