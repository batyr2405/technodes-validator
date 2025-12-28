import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SOURCE = "http://technodes.duckdns.org/stats.json";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }

    const data = await res.json();
    // отдаём как есть — структура уже такая, как ждёт фронт:
    // { validator, network, status, commission, stake_total, rewards_24h, updated }
    return NextResponse.json(data);
  } catch (e: any) {
    console.error("stats api error:", e);
    return NextResponse.json(
      { error: "stats not available", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
