import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SOURCE = "http://technodes.duckdns.org/stats.json";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");

    const data = await res.json();

    return NextResponse.json({
      commission: Number(data.commission).toFixed(2)
    });

  } catch (e) {
    console.error("commission api error:", e);
    return NextResponse.json(
      { error: "commission api failed" },
      { status: 500 }
    );
  }
}
