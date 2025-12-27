import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const JSON_URL = "http://technodes.duckdns.org/rewards.json";
const CSV_URL  = "http://technodes.duckdns.org/rewards.csv";

export async function GET() {
  try {
    const [jsonRes, csvRes] = await Promise.all([
      fetch(JSON_URL, { cache: "no-store" }),
      fetch(CSV_URL,  { cache: "no-store" }),
    ]);

    if (!jsonRes.ok || !csvRes.ok) throw new Error("fetch failed");

    const total = await jsonRes.json();
    const csvText = await csvRes.text();

    // parse CSV (skip header)
    const lines = csvText.trim().split("\n").slice(1);

    const last24 = lines
      .map((l) => {
        const [, reward] = l.split(",");
        return parseFloat(reward);
      })
      .filter((n) => !isNaN(n));

    const rewards_24h =
      last24.length > 0 ? last24[last24.length - 1] : 0;

    return NextResponse.json({
      rewards_24h,
      diff: rewards_24h,
      total_rewards: total.total_rewards,
      updated: total.updated,
    });
  } catch (e) {
    console.error("rewards api error:", e);
    return NextResponse.json(
      { error: "rewards api failed" },
      { status: 500 }
    );
  }
}
