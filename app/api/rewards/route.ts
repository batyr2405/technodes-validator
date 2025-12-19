// app/api/rewards/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(
      "http://62.84.177.12:8090/rewards/history",
      { cache: "no-store" }
    );

    if (!res.ok) {
      throw new Error("backend error");
    }

    const history = await res.json();

    const last = history[history.length - 1]?.rewards ?? 0;

    return NextResponse.json({
      rewards_24h: last,
      history,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load rewards" },
      { status: 500 }
    );
  }
}
