import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // пути к файлам
    const rewardsPath = path.join(process.cwd(), "rewards.csv");
    const statsPath = path.join(process.cwd(), "stats.json");

    // читаем файлы
    const rewardsRaw = await fs.readFile(rewardsPath, "utf-8");
    const statsRaw = await fs.readFile(statsPath, "utf-8");

    const stats = JSON.parse(statsRaw);

    // парсим CSV (берём последнюю строку)
    const lines = rewardsRaw.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const [, rewardsStr] = lastLine.split(",");

    const rewards24h = parseFloat(rewardsStr);
    const stake = Number(stats.stake_total);

    const apr =
      stake > 0 ? (rewards24h * 365 * 100) / stake : 0;

    return NextResponse.json({
      ok: true,
      rewards_24h: Number(rewards24h.toFixed(6)),
      apr: Number(apr.toFixed(2)),
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to load rewards",
      },
      { status: 500 }
    );
  }
}
