import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const JSON_URL = "http://technodes.duckdns.org/rewards.json";
const CSV_URL = "http://technodes.duckdns.org/rewards.csv";

export async function GET() {
  try {
    const [jsonRes, csvRes] = await Promise.all([
      fetch(JSON_URL, { cache: "no-store" }),
      fetch(CSV_URL, { cache: "no-store" }),
    ]);

    if (!jsonRes.ok || !csvRes.ok) {
      console.error("DEBUG rewards JSON:", jsonRes.status, jsonRes.url);
      console.error("DEBUG rewards CSV:", csvRes.status, csvRes.url);
      throw new Error("fetch failed");
    }

    const totalJson = await jsonRes.json();
    const csvText = await csvRes.text();

    // ===== считаем rewards_24h по CSV =====
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;

    const lines = csvText.trim().split("\n").slice(1); // пропускаем header

    let rewards_24h = 0;

    for (const line of lines) {
      const [dateStr, rawAmount] = line.split(",");
      if (!dateStr || !rawAmount) continue;

      const ts = Date.parse(dateStr.trim());
      if (Number.isNaN(ts) || ts < dayAgo) continue;

      const trimmed = rawAmount.trim();
      const normalized = trimmed.startsWith(".")
        ? "0" + trimmed
        : trimmed;

      const parsed = parseFloat(normalized);
      if (Number.isNaN(parsed)) continue;

      // если это огромные числа (atto), конвертим в ASHM
      const ashm = parsed > 1e10 ? parsed / 1e18 : parsed;

      rewards_24h += ashm;
    }

    const total = Number(totalJson.total_rewards ?? 0);
    const updated = totalJson.updated || new Date().toISOString();

    const price_usdt = 0.05; // временный хардкод, потом можно взять с CoinGecko
    const rewards_usdt = rewards_24h * price_usdt;
    const total_usdt = total * price_usdt;

    return NextResponse.json({
      rewards_24h,
      total_rewards: total,
      price_usdt: 0.05,
      rewards_usdt: rewards_24h * 0.05,
      total_usdt: total * 0.05,
      updated: new Date().toISOString(),
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
