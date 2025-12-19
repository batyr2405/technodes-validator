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
      const res = await fetch("/api/stats", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Bad response");

      const json = await res.json();
      setData(json);
      setError(false);
    } catch (e) {
      console.error("❌ Failed to load data", e);
      setError(true);
    }
  };

  useEffect(() => {
    loadStats(); // первый запрос сразу

    const interval = setInterval(loadStats, 60_000); // каждые 60 сек
    return () => clearInterval(interval);
  }, []);

  if (!data && !error) {
    return <p style={{ padding: 20 }}>Loading…</p>;
  }

  return (
    <main style={{ padding: 32 }}>
      {error && (
        <p style={{ color: "#dc2626", marginBottom: 8 }}>
          ⚠️ Last update failed — showing cached data
        </p>
      )}

      {data && (
        <>
          <h1>{data.validator}</h1>
          <p>{data.network}</p>
          <p>Status: {data.status}</p>
          <p>Total stake: {data.stake_total} ASHM</p>
          <p>Commission: {data.commission * 100}%</p>
          <p>Rewards (24h): {data.rewards_24h} ASHM</p>
          <p>
            Updated: {new Date(data.updated).toLocaleString()}
          </p>
        </>
      )}
    </main>
  );
}
