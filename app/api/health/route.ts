import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const SOURCE = "http://technodes.duckdns.org/health";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({
      status: data.status,
      updated: data.last_check ?? new Date().toISOString(),
      rpc: data.rpc,
      height: data.height,
      catching_up: data.catching_up,
      voting_power: data.voting_power,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "health api failed", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
