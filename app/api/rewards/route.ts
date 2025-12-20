// app/api/rewards/route.ts

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // ⬅️ КЛЮЧЕВОЕ
export const revalidate = 0;            // ⬅️ КЛЮЧЕВОЕ

export async function GET() {
  try {
    const res = await fetch("http://62.84.177.12:8090/rewards/history", {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch rewards backend" },
        { status: 500 }
      );
    }

    const history = await res.json();

    const rewards_24h =
      history.length > 0 ? history[history.length - 1].rewards : 0;

    return NextResponse.json({
      rewards_24h,
      history,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Rewards API error" },
      { status: 500 }
    );
  }
}
