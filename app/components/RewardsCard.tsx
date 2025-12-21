"use client";

import { useEffect, useState } from "react";

type RewardsData = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

export default function RewardsCard() {
  const [data, setData] = useState<RewardsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load rewards");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError("Failed to load rewards");
    }
  };

  useEffect(() => {
    loadRewards();
    const interval = setInterval(loadRewards, 60_000); // ⏱ 60 сек
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return <div style={card}>❌ {error}</div>;
  }

  if (!data) {
    return <div style={card}>⏳ Loading rewards...</div>;
  }

  return (
    <div style={card}>
      <h3>Rewards (24h)</h3>
      <div style={value}>+{data.rewards_24h.toFixed(4)} ASHM</div>
      <div>APR (est.): {data.apr.toFixed(2)} %</div>
      <div style={updated}>Updated: {new Date(data.updated).toLocaleString()}</div>
    </div>
  );
}

const card = {
  padding: 24,
  borderRadius: 16,
  background: "#111",
  color: "#fff",
  maxWidth: 420,
};

const value = {
  fontSize: 28,
  fontWeight: "bold",
  color: "#6ee7b7",
};

const updated = {
  marginTop: 8,
  fontSize: 12,
  opacity: 0.6,
};
