"use client";

import { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */
type RewardsResponse = {
  rewards_24h: number;
  updated: string;
};

/* =========================
   PAGE
========================= */
export default function Page() {
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD REWARDS
  ========================= */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setRewards({
        rewards_24h: Number(data.rewards_24h) || 0,
        updated: data.updated,
      });

      setError(null);
    } catch {
      setError("Failed to load rewards");
    }
  };

  /* =========================
     AUTO UPDATE (30s)
  ========================= */
  useEffect(() => {
    loadRewards();
    const timer = setInterval(loadRewards, 30_000);
    return () => clearInterval(timer);
  }, []);

  /* =========================
     RENDER
  ========================= */
  return (
    <main className="max-w-xl mx-auto p-6 space-y-6">
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <h1 className="text-2xl font-bold">TechNodes-01 Validator</h1>
        <p className="text-gray-600">
          You are on the TechNodes validator page.  
          Here you see live status and real rewards of a single Shardeum node —
          fully transparent and updated automatically.
        </p>
      </div>

      {/* =========================
          VALIDATOR STATUS
      ========================= */}
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 animate-[pulse_1.5s_infinite]" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>
        <span className="font-medium text-green-600">active</span>
      </div>

      {/* =========================
          REWARDS CARD
      ========================= */}
      <div className="rounded-xl border bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-500">Rewards (24h)</div>

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        {!rewards && !error && (
          <div className="text-gray-400 mt-2">Loading...</div>
        )}

        {rewards && (
          <>
            <div className="text-2xl font-bold text-green-600 mt-2">
              +{rewards.rewards_24h.toFixed(4)} ASHM
            </div>

            <div className="text-sm text-gray-600 mt-1">
              Updated: {new Date(rewards.updated).toLocaleString()}
            </div>

            <div className="text-xs text-gray-400 mt-2">
              Auto-updated every 30 seconds
            </div>
          </>
        )}
      </div>
    </main>
  );
}
