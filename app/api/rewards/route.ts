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
    if (!res.ok) return 0;
    const data = await res.json();
    const p = data?.shardeum?.usd;
    return typeof p === "number" && Number.isFinite(p) ? p : 0;
  } catch {
    return 0;
  }
}

function withTimeout(url: string, ms = 8000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

async function fetchTextWithFallback(path: string): Promise<string> {
  // порядок: локальный nginx -> duckdns -> прямой IP
  const bases = [
    process.env.TECHNODES_BASE_URL?.trim(),
    "http://127.0.0.1",
    "http://technodes.duckdns.org",
    "http://62.84.177.12",
  ].filter(Boolean) as string[];

  let lastErr: any = null;

  for (const base of bases) {
    const url = `${base}${path}`;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const { signal, done } = withTimeout(url, 8000);
      try {
        const res = await fetch(url, { cache: "no-store", signal });
        done();
        if (!res.ok) {
          lastErr = new Error(`bad status ${res.status} for ${url}`);
          continue;
        }
        return await res.text();
      } catch (e) {
        done();
        lastErr = e;
      }
    }
  }

  throw lastErr || new Error("fetch failed");
}

function parseMaybeAtto(s: string): number {
  const trimmed = s.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.startsWith(".") ? "0" + trimmed : trimmed;
  const n = parseFloat(normalized);
  if (!Number.isFinite(n)) return 0;
  return n > 1e10 ? n / 1e18 : n; // atto -> ASHM
}

export async function GET() {
  try {
    const [jsonText, csvText] = await Promise.all([
      fetchTextWithFallback("/rewards.json"),
      fetchTextWithFallback("/rewards.csv"),
    ]);

    const totalJson = JSON.parse(jsonText);
    const total = Number(totalJson.total_rewards ?? 0);

    // rewards_24h = разница двух последних строк cumulative-CSV
    const lines = csvText.trim().split("\n").slice(1);
    let rewards_24h = 0;

    if (lines.length >= 2) {
      const last = lines[lines.length - 1].split(",")[1] ?? "";
      const prev = lines[lines.length - 2].split(",")[1] ?? "";
      const v1 = parseMaybeAtto(last);
      const v2 = parseMaybeAtto(prev);
      rewards_24h = v1 - v2;
      if (!Number.isFinite(rewards_24h) || rewards_24h < 0) rewards_24h = 0;
    }

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
    return NextResponse.json(
      { error: "rewards api failed", reason: e?.message || "unknown" },
      { status: 500 }
    );
  }
}
