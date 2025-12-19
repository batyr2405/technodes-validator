"use client";

import { useEffect, useState } from "react";

type RewardsResponse = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

export default function Page() {
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rewards", { cache: "no-store" });
        if (!res.ok) throw new Error("API error");

        const data = await res.json();

        if (
          typeof data !== "object" ||
          typeof data.rewards_24h !== "number"
        ) {
          throw new Error("Invalid response");
        }

        setRewards(data);
      } catch (e) {
        console.error(e);
        setError("Failed to load rewards");
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0f1a] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl bg-[#121826] p-6 shadow-xl space-y-5">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">TechNodes Validator</h1>

          {/* ACTIVE BADGE */}
          <div className="flex items-center gap-2 text-sm font-medium text-green-400">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            ACTIVE
          </div>
        </div>

        {/* CONTENT */}
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}

        {!error && !rewards && (
          <div className="text-gray-400 text-sm">Loading…</div>
        )}

        {rewards && (
          <div className="space-y-4">
            <Stat label="Rewards (24h)" value={`+${rewards.rewards_24h.toFixed(4)} ASHM`} />
            <Stat label="APR (est.)" value={`${rewards.apr.toFixed(2)} %`} />
            <div className="text-xs text-gray-500 pt-2">
              Updated: {new Date(rewards.updated).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-[#0e1424] rounded-lg px-4 py-3">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
