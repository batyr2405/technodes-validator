"use client";

import { useEffect, useState } from "react";

type RewardsApi = {
  total_rewards: number;
  rewards_24h: number;
  updated: string;
  error?: string;
  reason?: string;
};

export default function TotalRewards() {
  const [data, setData] = useState<RewardsApi | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ---- API: rewards ----
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || json.error) throw new Error(json.reason || "rewards api failed");

      setData(json);
      setError(null);
    } catch (e) {
      console.error("TotalRewards UI error:", e);
      setError("failed");
    }
  };

  // ---- API: SHM → USDT price ----
  const loadPrice = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=shardeum&vs_currencies=usd",
        { cache: "no-store" }
      );
      const json = await res.json();
      setPrice(json?.shardeum?.usd ?? null);
    } catch {
      setPrice(null);
    }
  };

  useEffect(() => {
    loadRewards();
    loadPrice();

    const id = setInterval(() => {
      loadRewards();
      loadPrice();
    }, 30_000);

    return () => clearInterval(id);
  }, []);

  if (error && !data) return <>--</>;
  if (!data) return <>…</>;

  const usd =
    price != null ? (data.total_rewards * price).toFixed(2) : null;

  const formattedDate = new Date(data.updated).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-1">
      <div className="text-3xl font-semibold">
        {data.total_rewards.toFixed(4)} ASHM
        {usd && (
          <span className="ml-2 text-gray-400 text-lg">
            (~${usd})
          </span>
        )}
      </div>

      <div className="text-xs text-gray-500">
        Обновлено: {formattedDate}
        {price && (
          <> · 1 SHM = ${price.toFixed(4)}</>
        )}
      </div>
    </div>
  );
}
