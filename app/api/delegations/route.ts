import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SOURCE = "http://technodes.duckdns.org/delegations.json";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { cache: "no-store" });

    if (!res.ok) throw new Error("fetch failed");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    console.error("delegations api error:", e);
    return NextResponse.json(
      { error: "delegations api failed" },
      { status: 500 }
    );
  }
}
