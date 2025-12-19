"use client";

import { useEffect, useState } from "react";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
  rewards_24h: number;
  updated: string;
};

export default function Home() {
  const [data, setData] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  const loadStats = async () => {
    try {
      const res = await fetch("/api/stats", { cache: "no-store" });
      if (!res.ok) throw new Error();
      setData(await res.json());
      setError(false);
    } catch {
      setError(true);
    }
  };

  useEffect(() => {
    loadStats();
    const i = setInterval(loadStats, 60_000);
    return () => clearInterval(i);
  }, []);

  if (!data) return <p className="p-6">Loading…</p>;

  const isActive = data.status === "active";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{data.validator}</h1>
          <span
            className={`px-3 py-1 rounded-full text-white text-sm ${
              isActive ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {data.status.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-500">{data.network}</p>

        <div className="grid grid-cols-2 gap-4">
          <Stat label="Stake" value={`${data.stake_total} ASHM`} />
          <Stat label="Commission" value={`${data.commission * 100}%`} />
          <Stat label="Rewards (24h)" value={`+${data.rewards_24h}`} />
          <Stat
            label="APR"
            value={`${(
              (data.rewards_24h * 365 * 100) /
              data.stake_total
            ).toFixed(2)}%`}
          />
        </div>

        <p className="text-xs text-gray-400 text-right">
          Updated {new Date(data.updated).toLocaleString()}
        </p>

        {error && (
          <p className="text-xs text-red-500">
            ⚠️ Last update failed
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-100 rounded-lg p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
