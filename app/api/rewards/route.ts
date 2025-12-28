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
const now = new Date();
const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;

const lines = csvText
  .trim()
  .split("\n")
  .slice(1)
  .map((l) => {
    const [dateStr, rewardStrRaw] = l.split(",");

    const rewardStr = rewardStrRaw.trim().startsWith(".")
      ? "0" + rewardStrRaw.trim()
      : rewardStrRaw.trim();

    return {
      date: new Date(dateStr.trim()),
      reward: parseFloat(rewardStr),
    };
  })
  .filter((r) => !isNaN(r.reward));

const rewards_24h = lines
  .filter((r) => r.date.getTime() >= dayAgo)
  .reduce((sum, r) => sum + r.reward, 0);

    return NextResponse.json({
      rewards_24h,
      diff: rewards_24h,
      total_rewards: total.total_rewards,
      updated: total.updated,
    });

  } catch (e: any) {
    console.error("rewards api error:", e?.message || e);

    return NextResponse.json(
      { error: "rewards api failed", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
