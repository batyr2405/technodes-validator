"use client";

import { useEffect, useState } from "react";

type RewardsApi = {
  total_rewards: number;
  total_usdt?: number;
  updated: string;
  price_usdt?: number;
  error?: string;
  reason?: string;
};

export default function TotalRewards() {
  const [data, setData] = useState<RewardsApi | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.reason || "rewards api failed");
      }

      setData(json);
      setError(null);
    } catch (e) {
      console.error("TotalRewards UI error:", e);
      setError("failed");
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  if (error && !data) return <>--</>;
  if (!data) return <>…</>;

  const usd =
    data.total_usdt != null ? data.total_usdt.toFixed(2) : undefined;

  const formattedDate = new Date(data.updated).toLocaleString();

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
        Updated: {formattedDate}
        {data.price_usdt && (
          <> · 1 SHM = ${data.price_usdt.toFixed(4)}</>
        )}
      </div>
    </div>
  );
}

