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

    if (!jsonRes.ok || !csvRes.ok) {
      throw new Error(
        `fetch failed: json=${jsonRes.status} csv=${csvRes.status}`
      );
    }

    // ⚙️ total_rewards и updated берём из JSON
    const total: { total_rewards: number; updated: string } =
      await jsonRes.json();

    // ⚙️ Парсим CSV
    const csvText = await csvRes.text();

    const rows = csvText
      .trim()
      .split("\n")
      .slice(1) // пропускаем заголовок
      .map((line) => {
        const [dateStr, rewardStrRaw] = line.split(",");

        const rewardStr = rewardStrRaw.trim();
        const normalized =
          rewardStr.startsWith(".") ? `0${rewardStr}` : rewardStr;

        return {
          date: new Date(dateStr.trim()),
          reward: parseFloat(normalized),
        };
      })
      .filter((row) => !Number.isNaN(row.reward));

    // ⚙️ Сумма за последние 24 часа
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const sum24 = rows
      .filter((row) => row.date.getTime() >= dayAgo)
      .reduce((acc, row) => acc + row.reward, 0);

    // Если за последние 24 часа нет строк (как сейчас),
    // используем последнюю строку как "Rewards (24h)", чтобы не было 0
    const rewards_24h =
      sum24 > 0 && Number.isFinite(sum24)
        ? sum24
        : rows.length
        ? rows[rows.length - 1].reward
        : 0;

    return NextResponse.json({
      rewards_24h,
      diff: rewards_24h,
      total_rewards: total.total_rewards,
      updated: total.updated,
    });
  } catch (e: any) {
    console.error("rewards api error:", e);
    return NextResponse.json(
      {
        error: "rewards api failed",
        reason: e?.message ?? "unknown",
      },
      { status: 500 }
    );
  }
}
