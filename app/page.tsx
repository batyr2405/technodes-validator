"use client";

import { useEffect, useState } from "react";
import RewardsChart from "./components/RewardsChart";
import TotalRewards from "./components/TotalRewards";

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
  rewards_usdt?: number;
  price_usdt?: number;
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
  last_delegation?: Partial<Delegation> | null;
  updated: string;
};

function utcPlus3DayProgress(dateLike?: string) {
  const now = dateLike ? new Date(dateLike) : new Date();
  const minutes = (((now.getUTCHours() + 3) % 24) * 60) + now.getUTCMinutes();
  return Math.min(minutes / 1439, 1);
}

/* =========================
   PAGE
========================= */
export default function Page() {
  /* STATE */
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [delegations, setDelegations] =
    useState<DelegationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stakeFlash, setStakeFlash] = useState(false);
  const dayProgress = utcPlus3DayProgress(rewards?.updated);
  const stemHeight = 18 + Math.round(dayProgress * 76);
  const bloomScale = 0.35 + dayProgress * 0.85;
  const crownOpacity = dayProgress > 0.55 ? 1 : 0;
  const flowerOpacity = dayProgress <= 0.75 ? 1 : 0;
  const lastDelegation = delegations?.last_delegation;
  const lastDelegationAmount =
    typeof lastDelegation?.delta === "number"
      ? lastDelegation.delta
      : typeof lastDelegation?.amount === "number"
        ? lastDelegation.amount
        : null;

  /* LOADERS */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      if (!res.ok) throw new Error("rewards api failed");

      const data = await res.json();

      setRewards({
        rewards_24h: Number(data.rewards_24h) || 0,
        updated: data.updated,
        rewards_usdt:
          typeof data.rewards_usdt === "number"
            ? data.rewards_usdt
            : undefined,
        price_usdt:
          typeof data.price_usdt === "number" ? data.price_usdt : undefined,
      });

      setError(null);
    } catch {
      setError("Failed to load rewards");
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error("stats api failed");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    }
  };

  const loadDelegations = async () => {
    try {
      const res = await fetch("/api/delegations", { cache: "no-store" });
      if (!res.ok) throw new Error("delegations api failed");

      const data: DelegationsResponse = await res.json();

      if (data.diff && data.diff > 0) {
        setStakeFlash(true);
        setTimeout(() => setStakeFlash(false), 3000);
      }

      setDelegations(data);
    } catch {
      setDelegations(null);
    }
  };

  const loadHealth = async () => {
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      if (!res.ok) throw new Error("health api failed");
      const data = await res.json();
      setHealth(data);
    } catch {
      setHealth(null);
    }
  };

  /* AUTO UPDATE (30s) */
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

  /* RENDER */
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

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 status-glow" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
                </span>
                <span className="text-sm text-green-400 font-medium">ACTIVE</span>
              </div>

              <div className="rounded-md border border-green-400/20 bg-green-400/10 px-2 py-1 text-right">
                <div className="text-[10px] uppercase tracking-wide text-gray-400">
                  Last delegation
                </div>
                <div className="text-xs font-semibold text-green-300">
                  {lastDelegationAmount != null
                    ? `${lastDelegationAmount.toLocaleString()} SHM`
                    : "-- SHM"}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* TOTAL STAKE */}
            <div>
              <div className="text-sm text-gray-400">Total Stake</div>
              <div
                className={`text-xl font-semibold transition-all duration-500 ${
                  stakeFlash ? "text-green-400 animate-pulse" : ""
                }`}
              >
                {stats
                  ? stats.stake_total.toLocaleString()
                  : "—"}{" "}
                SHM
              </div>

              {delegations && delegations.diff > 0 && (
                <div className="text-xs text-green-400 mt-1">
                  +{delegations.diff} SHM
                </div>
              )}
            </div>

            {/* COMMISSION */}
            <div>
              <div className="text-sm text-gray-400">Commission</div>
              <div className="text-xl font-semibold">
                {stats ? (stats.commission * 100).toFixed(2) : "--"} %
              </div>
            </div>
          </div>
        </div>

        {/* NEW DELEGATION BANNER (compact) */}
        {delegations?.new_delegations?.length > 0 && (
          <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 animate-pulse">
            <div className="text-sm text-green-300 font-medium mb-1">
              New delegation detected 🚀
            </div>

            {delegations.new_delegations.map((d, i) => (
              <div key={i} className="text-xs text-gray-300">
                <span className="text-green-400">
                  +{d.delta.toLocaleString()} SHM
                </span>{" "}
                from{" "}
                <span className="font-mono text-gray-400">
                  {d.delegator.slice(0, 10)}…
                </span>
              </div>
            ))}
          </div>
        )}


        {/* REWARDS TODAY */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">Rewards today</div>
            <div className="flex items-center gap-2">
              <div className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-gray-300">
                UTC+3
              </div>
              <div className="text-xs text-green-400">live</div>
            </div>
          </div>

          {error && <div className="text-red-400 text-sm mt-3">{error}</div>}

          {!rewards && !error && (
            <div className="skeleton h-8 w-48 rounded mt-3" />
          )}

          {rewards && (
            <>
              <div className="mt-4 flex justify-center">
                <div className="reward-plant-wrap" aria-hidden="true">
                  <div className="reward-plant-ground" />
                  <div
                    className="reward-plant-stem"
                    style={{ height: `${stemHeight}px` }}
                  />
                  <div
                    className="reward-plant-flower"
                    style={{
                      opacity: flowerOpacity,
                      transform: `translateX(-50%) scale(${bloomScale})`,
                    }}
                  >
                    <span />
                    <span />
                    <span />
                    <span />
                    <i />
                  </div>
                  <div
                    className="reward-plant-crown"
                    style={{
                      opacity: crownOpacity,
                      transform: `translateX(-50%) scale(${0.45 + dayProgress * 0.7})`,
                    }}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 mt-3 text-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl">🛢️</span>
                  <div className="text-3xl font-bold text-green-400">
                    +{rewards.rewards_24h.toFixed(4)} SHM
                  </div>
                </div>

                {rewards.price_usdt != null && (
                  <div className="text-sm text-gray-400">
                    (~ $
                    {(rewards.rewards_24h * rewards.price_usdt).toFixed(2)})
                  </div>
                )}
              </div>

              <div className="text-xs text-gray-500 mt-3">
                Updated: {new Date(rewards.updated).toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">
                UTC+3 day, server-synced snapshot every minute
              </div>
            </>
          )}
        </div>

        {/* TOTAL REWARDS */}
        <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg">
          <div className="text-sm text-gray-400 mb-2">Total Rewards</div>

          <div className="text-3xl font-bold text-green-400 mb-4">
            <TotalRewards />
          </div>

          <div className="mt-4">
            <RewardsChart />
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
