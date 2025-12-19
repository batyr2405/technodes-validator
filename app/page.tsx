"use client";

import { useEffect, useState } from "react";

type RewardsResponse = {
  ok: boolean;
  rewards_24h?: number;
  updated?: string;
  error?: string;
};

export default function Home() {
  const [data, setData] = useState<RewardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRewards = async () => {
      try {
        const res = await fetch("/api/rewards", {
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok || json.ok === false) {
          throw new Error(json.error || "Failed to load rewards");
        }

        setData(json);
      } catch (e: any) {
        setError(e.message || "Client error");
      }
    };

    loadRewards();
  }, []);

  if (error) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.card, borderColor: "#dc2626" }}>
          <h1 style={{ color: "#dc2626" }}>❌ Failed to load rewards</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1>⏳ Loading rewards…</h1>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Rewards (24h)</h1>

        <div style={styles.value}>
          +{data.rewards_24h?.toFixed(6)} ASHM
        </div>

        <div style={styles.updated}>
          Updated: {new Date(data.updated!).toLocaleString()}
        </div>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0b0b0f",
    color: "#fff",
  },
  card: {
    background: "#111827",
    padding: "32px",
    borderRadius: "16px",
    minWidth: "320px",
    textAlign: "center",
    border: "1px solid #1f2937",
  },
  title: {
    fontSize: "20px",
    marginBottom: "12px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#22c55e",
  },
  updated: {
    marginTop: "12px",
    fontSize: "12px",
    opacity: 0.6,
  },
};
