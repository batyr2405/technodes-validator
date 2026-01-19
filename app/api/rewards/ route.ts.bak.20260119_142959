import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

async function fetchShmPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd",
      { cache: "no-store" }
    );

    if (!res.ok) {
      console.error("price fetch failed with status", res.status);
      return 0;
    }

    const data = await res.json();
    const price = data?.shardeum?.usd;

    if (typeof price === "number" && Number.isFinite(price)) {
      return price;
    }

    return 0;
  } catch (e) {
    console.error("price fetch error:", e);
    return 0;
  }
}


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

// ===== считаем rewards_24h как разницу двух последних записей =====
const lines = csvText.trim().split("\n").slice(1);

let rewards_24h = 0;

if (lines.length >= 2) {
  const last = lines[lines.length - 1].split(",")[1].trim();
  const prev = lines[lines.length - 2].split(",")[1].trim();

  const n1 = parseFloat(last.startsWith(".") ? "0" + last : last);
  const n2 = parseFloat(prev.startsWith(".") ? "0" + prev : prev);

  const val1 = n1 > 1e10 ? n1 / 1e18 : n1;
  const val2 = n2 > 1e10 ? n2 / 1e18 : n2;

  rewards_24h = val1 - val2;
}
    const total = Number(totalJson.total_rewards ?? 0);
    const updated = totalJson.updated || new Date().toISOString();   
    const price_usdt = await fetchShmPrice();

    return NextResponse.json({
      rewards_24h,
      total_rewards: total,
      price_usdt,
      rewards_usdt: rewards_24h * price_usdt,
      total_usdt: total * price_usdt,
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
