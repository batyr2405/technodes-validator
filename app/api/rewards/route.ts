import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const CSV_PATH = "/var/www/technodes/rewards.csv";
const TOTAL_PATH = "/var/www/technodes/rewards.json";

export async function GET() {
  try {
    const [csvRaw, totalRaw] = await Promise.all([
      fs.readFile(CSV_PATH, "utf8"),
      fs.readFile(TOTAL_PATH, "utf8"),
    ]);

    const total = JSON.parse(totalRaw);

    const lines = csvRaw.trim().split("\n").slice(1); // skip header
    const now = new Date();

    let rewards24h = 0;

    for (const line of lines) {
      const [dateStr, rewardStr] = line.split(",");
      const dt = new Date(dateStr);

      if (now.getTime() - dt.getTime() <= 24 * 60 * 60 * 1000) {
        rewards24h += parseFloat(rewardStr);
      }
    }

    return NextResponse.json({
      rewards_24h: Number(rewards24h.toFixed(6)),
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
