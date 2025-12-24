import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SNAPSHOT_URL = "http://62.84.177.12/snapshots/rewards.json";

export async function GET() {
  try {
    const res = await fetch(SNAPSHOT_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");

    const data = await res.json();

    return NextResponse.json({
      rewards_24h: data.rewards_24h,
      diff: data.diff,
      total_rewards: data.total_rewards,
      updated: data.updated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "rewards unavailable" },
      { status: 500 }
    );
  }
}
