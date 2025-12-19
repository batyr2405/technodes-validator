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
    fetch("/api/rewards", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Bad response");
        return res.json();
      })
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500 bg-red-950 p-4 text-sm">
        ❌ Failed to load rewards
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4 text-sm text-neutral-400">
        Loading rewards…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-2">
      <div className="text-sm text-neutral-400">Rewards (24h)</div>

      <div className="text-2xl font-mono font-bold text-green-400">
        +{data.rewards_24h.toFixed(4)} ASHM
      </div>

      <div className="text-sm">
        APR (est.): <span className="font-mono">{data.apr.toFixed(2)} %</span>
      </div>

      <div className="text-xs text-neutral-500">
        Updated: {new Date(data.updated).toLocaleString()}
      </div>
    </div>
  );
}
