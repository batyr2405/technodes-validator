"use client";
import RewardsChart from "./components/RewardsChart";
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

type Delegation = {
  delegator: string;
  amount: number;
  delta: number;
};

type DelegationsResponse = {
  total_stake: number;
  diff: number;
  new_delegations: Delegation[];
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
  const [delegations, setDelegations] =
    useState<DelegationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
 const [stakeFlash, setStakeFlash] = useState(false);
  /* =========================
     LOADERS
  ========================= */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      if (!res.ok) throw new Error();
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
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStats(data);
    } catch {}
  };

const loadDelegations = async () => {
  try {
    const res = await fetch("/api/delegations", { cache: "no-store" });
    if (!res.ok) throw new Error();

    const data = await res.json();

    // 🔔 если есть новый стейк
    if (data.diff && data.diff > 0) {
      setStakeFlash(true);

      // выключаем подсветку через 3 сек
      setTimeout(() => setStakeFlash(false), 3000);
    }

    setDelegations(data);
  } catch {}
};
  const loadHealth = async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error();
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
    loadStats();
    loadDelegations();
    loadHealth();

    const t = setInterval(() => {
      loadRewards();
      loadStats();
      loadDelegations();
      loadHealth();
    }, 30_000);

    return () => clearInterval(t);
  }, []);

  /* =========================
     RENDER
  ========================= */
  return (
    <main className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black opacity-90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.12),transparent_60%)]" />

      {/* CONTENT */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16 space-y-10">

        {/* INTRO */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Welcome 👋</h1>
          <p className="text-gray-300">
            Public dashboard of <b>TechNodes-01</b> validator.
          </p>
          <p className="text-gray-400">
            Only real on-chain data from my own node.
          </p>
        </div>

        {/* VALIDATOR CARD */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">TechNodes-01</h2>
              <p className="text-gray-400 mt-1">Shardeum</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 status-glow" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
              </span>
              <span className="text-sm text-green-400 font-medium">ACTIVE</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            <div>
              <div className="text-sm text-gray-400">Total Stake</div>
              <div
                className={`text-xl font-semibold transition-all duration-500 ${
                  delegations && delegations.diff > 0
                   ? "text-green-400 animate-pulse"
                   : ""
                }`}
           >
                {delegations
                  ? delegations.total_stake.toLocaleString()
                  : "—"}{" "}
                ASHM
              </div>

              {delegations && delegations.diff > 0 && (
                 <div className="text-xs text-green-400 mt-1">
                   +{delegations.diff} ASHM
                 </div>
               )}
             </div> 
            <div>
              <div className="text-sm text-gray-400">Commission</div>
              <div className="text-xl font-semibold">
                {stats ? (stats.commission * 100).toFixed(2) : "--"} %
              </div>
            </div>
          </div>
        </div>


{delegations?.new_delegations?.length > 0 && (
  <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 animate-pulse">
    <div className="text-sm text-green-300 font-medium mb-1">
      New delegation detected 🚀
    </div>

    {delegations.new_delegations.map((d, i) => (
      <div key={i} className="text-xs text-gray-300">
        <span className="text-green-400">
          +{d.delta.toLocaleString()} ASHM
        </span>{" "}
        from{" "}
        <span className="font-mono text-gray-400">
          {d.delegator.slice(0, 10)}…
        </span>
      </div>
    ))}
  </div>
)}


{/* =========================
   NEW DELEGATIONS
========================= */}
{delegations && delegations.new_delegations.length > 0 && (
  <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-5 shadow-lg animate-pulse">
    <div className="text-sm text-green-400 font-semibold mb-3">
      🟢 New delegation received
    </div>

    {delegations.new_delegations.map((d, idx) => (
      <div
        key={idx}
        className="flex items-center justify-between text-sm text-gray-200"
      >
        <span className="font-mono truncate max-w-[220px]">
          {d.delegator}
        </span>

        <span className="text-green-400 font-semibold">
          +{d.delta} ASHM
        </span>
      </div>
    ))}
  </div>
)}




        {/* REWARDS */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="flex justify-between">
            <div className="text-sm text-gray-400">Rewards (24h)</div>
            <div className="text-xs text-green-400">live</div>
          </div>

          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}

          {!rewards && !error && (
            <div className="skeleton h-8 w-48 rounded mt-3" />
          )}

          {rewards && (
            <>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl">🛢️</span>
                <div className="text-3xl font-bold text-green-400">
                  +{rewards.rewards_24h.toFixed(4)} ASHM
                </div>
              </div>
              <RewardsChart />
              <div className="text-xs text-gray-500 mt-3">
                Updated: {new Date(rewards.updated).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                Auto-updated every 30 seconds
              </div>
            </>
          )}
        </div>

{/* =========================
   REWARDS HISTORY CHART
========================= */}
<div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
  <div className="text-sm text-gray-400 mb-2">
    Rewards history
  </div>

</div>


        {/* HEALTH */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="flex justify-between">
            <div className="text-sm text-gray-400">❤️ Node health</div>
            <div className="text-xs text-gray-500">live</div>
          </div>

          {health ? (
            <>
              <div className="flex items-center gap-3 mt-2">
                <span className="heartbeat text-red-500 text-xl">❤️</span>
                <span className="text-green-400 font-semibold">
                  {health.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Updated: {new Date(health.updated).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-gray-500 mt-4">
              Health data unavailable
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
