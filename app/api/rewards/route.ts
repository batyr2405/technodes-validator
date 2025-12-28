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
const now = new Date();
const dayAgo = now.getTime() - 24 * 60 * 60 * 1000;

const lines = csvText
  .trim()
  .split("\n")
  .slice(1)
  .map((l) => {
    const [dateStr, rewardStr] = l.split(",");

    const raw = rewardStr.trim().startsWith(".")
      ? "0" + rewardStr.trim()
      : rewardStr.trim();

    return {
      date: new Date(dateStr.trim()),
      total: parseFloat(raw) / 1e18,   // 👈 переводим в ASHM
    };
  })
  .filter((r) => !isNaN(r.total));
  

// прирост за последние 24 часа
let rewards_24h = 0;

for (let i = 1; i < lines.length; i++) {
  if (lines[i].date.getTime() >= dayAgo) {
    const diff = lines[i].total - lines[i - 1].total;
    if (diff > 0) rewards_24h += diff;
  }
}

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
