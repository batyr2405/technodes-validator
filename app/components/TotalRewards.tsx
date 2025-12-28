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

  if (error && !data) {
    return <>--</>;
  }

  if (!data) {
    // короткий лоадер, внутри уже есть обёртка с text-3xl
    return <>…</>;
  }

  return <>{data.total_rewards.toFixed(4)} ASHM</>;
}
