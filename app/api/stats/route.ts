import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CSV_URL = "http://technodes.duckdns.org/rewards.csv";

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });

    if (!res.ok) throw new Error(`CSV status ${res.status}`);

    const text = await res.text();

    const rows = text
      .trim()
      .split("\n")
      .slice(1)
      .map((l) => {
        const [dateStr, rewardStrRaw] = l.split(",");

        const trimmed = rewardStrRaw.trim();
        const normalized = trimmed.startsWith(".")
          ? `0${trimmed}`
          : trimmed;

        return parseFloat(normalized);
      })
      .filter((n) => !isNaN(n));

    const total_rewards = rows.reduce((a, b) => a + b, 0);

    return NextResponse.json({
      total_rewards,
      rows: rows.length,
      updated: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("stats api error:", e);
    return NextResponse.json(
      { error: "stats failed", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
