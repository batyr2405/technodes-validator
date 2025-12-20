"use client";

import { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */
type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
};

type RewardsResponse = {
  rewards_24h: number;
  updated: string;
};

type HealthResponse = {
  status: string;
  updated: string;
};

/* =========================
   PAGE
========================= */
export default function Page() {
  /* =========================
     STATE
  ========================= */
const [stats, setStats] = useState<Stats | null>(null);  
const [rewards, setRewards] = useState<RewardsResponse | null>(null);
const [health, setHealth] = useState<HealthResponse | null>(null);
const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD REWARDS
  ========================= */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      if (!res.ok) throw new Error("rewards");

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
  const loadStats = async () => {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed stats");

    const data = await res.json();
    setStats(data);
  } catch {
    // тихо падаем, UI сам покажет "--"
  }
};


  /* временный лог

const loadStats = async () => {
  try {
    const res = await fetch("/api/stats", { cache: "no-store" });
    const data = await res.json();
    console.log("STATS:", data);
    setStats(data);
  } catch (e) {
    console.error("Stats failed", e);
  }
};



  /* =========================
     LOAD HEALTH
  ========================= */
  const loadHealth = async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error("health");

      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  };

  /* =========================
     AUTO UPDATE (30s)
  ========================= */
  useEffect(() => {
    loadRewards();
    loadHealth();
    loadStats();

    const timer = setInterval(() => {
      loadRewards();
      loadHealth();
      loadStats();
    }, 30_000);

    return () => clearInterval(timer);
  }, []);

  /* =========================
     RENDER
  ========================= */
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* =========================
         BACKGROUND
      ========================= */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_60%)]" />

      {/* =========================
         CONTENT
      ========================= */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 space-y-10">

        {/* =========================
           INTRO
        ========================= */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome 👋</h1>
          <p className="text-gray-300">
            You are viewing the public dashboard of <b>TechNodes-01</b> validator.
          </p>
          <p className="text-gray-400">
            This page shows <b>only real data from my own node</b> — no averages,
            no assumptions. Track real rewards, uptime and performance in the
            Shardeum network.
          </p>
        </div>

        {/* =========================
           TECHNODES VALIDATOR CARD
        ========================= */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">TechNodes-01</h2>
              <p className="text-gray-400 mt-1">Shardeum</p>
            </div>

            {/* STATUS */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 animate-[pulse_1.5s_infinite]" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-sm font-medium text-green-400">ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-sm text-gray-400">Total Stake</div>
              <div className="text-xl font-semibold">
                441 184 ASHM
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400">Commission</div>
              <div className="text-xl font-semibold">
                {stats ? (stats.commission * 100).toFixed(2) : "--"} %
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            Updated: 18.12.2025, 14:09:18
          </div>
        </div>

        {/* =========================
           REWARDS CARD
        ========================= */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="text-sm text-gray-400">Rewards (24h)</div>

          {error && (
            <div className="text-red-400 text-sm mt-2">{error}</div>
          )}

          {!rewards && !error && (
            <div className="text-gray-500 mt-2">Loading...</div>
          )}

          {rewards && (
            <>
              <div className="text-3xl font-bold text-green-400 mt-2">
                +{rewards.rewards_24h.toFixed(4)} ASHM
              </div>

              <div className="text-sm text-gray-300 mt-1">
                APR (est.): 0.00 %
              </div>

              <div className="text-xs text-gray-500 mt-2">
                Updated: {new Date(rewards.updated).toLocaleString()}
              </div>

              <div className="text-xs text-gray-400 mt-1">
                Auto-updated every 30 seconds
              </div>
            </>
          )}
        </div>

        {/* =========================
           HEALTH
        ========================= */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="text-sm text-gray-400">Node health</div>

          {health ? (
            <>
              <div className="text-green-400 font-semibold mt-2">
                Status: {health.status}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Updated: {new Date(health.updated).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-gray-500 mt-2">
              Health data unavailable
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
