import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SOURCE = "http://technodes.duckdns.org/commission.json";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { cache: "no-store" });

    if (!res.ok) throw new Error("fetch failed");

    const data = await res.json();
    return NextResponse.json(data);
 } catch (e: any) {
   console.error("commission api error:", e?.message || e);

   return NextResponse.json(
     { error: "commission api failed", details: e?.message || "unknown" },
     { status: 500 }
   ); 
 }
}
