import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const JSON_URL = "http://technodes.duckdns.org/rewards.json";
const CSV_URL = "http://technodes.duckdns.org/rewards.csv";

async function fetchShmPrice(): Promise<number> {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd",
      { cache: "no-store" }
    );
    if (!res.ok) return 0;
    const data = await res.json();
    const price = data?.shardeum?.usd;
    return typeof price === "number" && Number.isFinite(price) ? price : 0;
  } catch {
    return 0;
  }
}

function toNumberSafe(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// total_rewards_ashm приходит как строка вида "2267....086ashm" или просто число-строка
function attoToShm(attoStr: string): number {
  const cleaned = attoStr.trim().replace(/ashm$/i, "");
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return 0;
  return n / 1e18;
}

export async function GET() {
  try {
    const [jsonRes, csvRes, price_usdt] = await Promise.all([
      fetch(JSON_URL, { cache: "no-store" }),
      fetch(CSV_URL, { cache: "no-store" }),
      fetchShmPrice(),
    ]);

    if (!jsonRes.ok || !csvRes.ok) throw new Error("fetch failed");

    const totalJson = await jsonRes.json();
    const csvText = await csvRes.text();

    // ===== rewards_24h как разница двух последних записей (cumulative snapshots) =====
    const lines = csvText.trim().split("\n").slice(1);
    let rewards_24h = 0;

    if (lines.length >= 2) {
      const last = lines[lines.length - 1].split(",")[1]?.trim();
      const prev = lines[lines.length - 2].split(",")[1]?.trim();

      const n1 = last ? parseFloat(last.startsWith(".") ? "0" + last : last) : 0;
      const n2 = prev ? parseFloat(prev.startsWith(".") ? "0" + prev : prev) : 0;

      const v1 = n1 > 1e10 ? n1 / 1e18 : n1;
      const v2 = n2 > 1e10 ? n2 / 1e18 : n2;

      rewards_24h = v1 - v2;
      if (!Number.isFinite(rewards_24h)) rewards_24h = 0;
    }

    // ===== TOTAL REWARDS (важно!) =====
    // новый формат rewards.json:
    // { total_rewards_shm: 22722.61, total_rewards_ashm: "2272...ashm", ... }
    let total_shm =
      toNumberSafe(totalJson.total_rewards_shm) ??
      (typeof totalJson.total_rewards_ashm === "string"
        ? attoToShm(totalJson.total_rewards_ashm)
        : null) ??
      toNumberSafe(totalJson.total_rewards) ?? // старый формат
      0;

    const updated =
      totalJson.updated || new Date().toISOString();

    return NextResponse.json({
      rewards_24h,
      total_rewards_shm: total_shm,
      // на всякий случай тоже отдаем (UI может использовать)
      total_rewards_ashm: totalJson.total_rewards_ashm,
      price_usdt,
      rewards_usdt: rewards_24h * price_usdt,
      total_usdt: total_shm * price_usdt,
      updated,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "rewards api failed", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
