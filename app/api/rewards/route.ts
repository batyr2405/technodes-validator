import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CSV_URL = "http://technodes.duckdns.org/rewards.csv";

type Row = {
  date: Date;
  reward: number;
};

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`CSV fetch failed, status ${res.status}`);
    }

    const csvText = await res.text();

    // разбор CSV
    const rows: Row[] = csvText
      .trim()
      .split("\n")
      .slice(1) // пропускаем заголовок
      .map((line) => {
        const [dateStr, rewardStrRaw] = line.split(",");
        if (!dateStr || rewardStrRaw === undefined) return null;

        const date = new Date(dateStr.trim());

        const trimmed = rewardStrRaw.trim();
        // фикс вида ".101871" → "0.101871"
        const normalized = trimmed.startsWith(".") ? `0${trimmed}` : trimmed;
        const reward = parseFloat(normalized);

        if (isNaN(reward) || Number.isNaN(date.getTime())) return null;

        return { date, reward };
      })
      .filter((r): r is Row => r !== null);

    // если нет данных
    if (rows.length === 0) {
      return NextResponse.json({
        rewards_24h: 0,
        diff: 0,
        total_rewards: 0,
        updated: new Date().toISOString(),
      });
    }

    // общая сумма
    const total_rewards = rows.reduce((sum, r) => sum + r.reward, 0);

    // 24h: считаем от последней даты в CSV (а не "текущее время")
    const maxDateMs = Math.max(...rows.map((r) => r.date.getTime()));
    const windowStart = maxDateMs - 24 * 60 * 60 * 1000;

    const rewards_24h = rows
      .filter((r) => r.date.getTime() >= windowStart)
      .reduce((sum, r) => sum + r.reward, 0);

    const updated = new Date(maxDateMs).toISOString();

    return NextResponse.json({
      rewards_24h,
      diff: rewards_24h,
      total_rewards,
      updated,
    });
  } catch (e: any) {
    console.error("rewards api error:", e);
    return NextResponse.json(
      {
        error: "rewards api failed",
        reason: e?.message || "unknown",
      },
      { status: 500 }
    );
  }
}
