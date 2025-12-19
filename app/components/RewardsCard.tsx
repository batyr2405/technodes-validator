"use client";

import { useEffect, useState } from "react";

type RewardsData = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

export default function RewardsCard() {
  const [data, setData] = useState<RewardsData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rewards", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      }
    };

    load();
    const i = setInterval(load, 60_000); // автообновление
    return () => clearInterval(i);
  }, []);

  if (error) {
    return (
      <div className="rounded-xl bg-red-950 text-red-300 p-5">
        ❌ Failed to load rewards
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-xl bg-zinc-900 p-5 animate-pulse">
        Loading rewards…
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
      <h2 className="text-lg font-semibold text-white">
        💰 Rewards
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Rewards (24h)" value={`+${data.rewards_24h} ASHM`} />
        <Stat label="APR (est.)" value={`${data.apr} %`} />
      </div>

      <p className="text-xs text-zinc-400">
        Updated {new Date(data.updated).toLocaleString()}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-xl font-semibold text-white">{value}</div>
    </div>
  );
}
