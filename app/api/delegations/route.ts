import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const SOURCE = "http://62.84.177.12/delegations.json";

export async function GET() {
  try {
    const res = await fetch(SOURCE, {
      headers: { "Cache-Control": "no-store" }
    });

    if (!res.ok) throw new Error("bad response");

    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "delegations api failed" },
      { status: 500 }
    );
  }
}
