import { NextResponse } from "next/server";

const STATS_URL = "http://62.84.177.12/stats.json"; // твой сервер

export async function GET() {
  try {
    const res = await fetch(STATS_URL, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("Failed to fetch stats");
    }

    const data = await res.json();

    const rewards24h = Number(data.rewards_24h);
    const stakeTotal = Number(data.stake_total);

    const apr =
      stakeTotal > 0
        ? (rewards24h * 365 * 100) / stakeTotal
        : 0;

    return NextResponse.json({
      rewards_24h: rewards24h,
      apr: Number(apr.toFixed(2)),
      updated: data.updated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load rewards" },
      { status: 500 }
    );
  }
}
