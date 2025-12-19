"use client";

import { useEffect, useState } from "react";

type Rewards = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

export default function RewardsCard() {
  const [data, setData] = useState<Rewards | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rewards", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("fetch failed");

        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(true);
      }
    };

    load();
    const i = setInterval(load, 60_000);
    return () => clearInterval(i);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border p-4 text-red-500">
        Failed to load rewards
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl border p-4 text-gray-400">
        Loading rewards…
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <h2 className="text-lg font-semibold">Rewards</h2>

      <div className="flex justify-between">
        <span>Rewards (24h)</span>
        <span className="font-mono text-green-600">
          +{data.rewards_24h} ASHM
        </span>
      </div>

      <div className="flex justify-between">
        <span>APR (est.)</span>
        <span className="font-mono">{data.apr} %</span>
      </div>

      <div className="text-xs text-gray-500">
        Updated: {new Date(data.updated).toLocaleString()}
      </div>
    </div>
  );
}
