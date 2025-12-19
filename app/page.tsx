"use client";

import { useEffect, useState } from "react";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
};

type Rewards = {
  ok: boolean;
  rewards_24h: number;
  apr?: number;
  updated: string;
};

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [statsRes, rewardsRes] = await Promise.all([
          fetch("/api/stats", { cache: "no-store" }),
          fetch("/api/rewards", { cache: "no-store" }),
        ]);

        const statsJson = await statsRes.json();
        const rewardsJson = await rewardsRes.json();

        if (!statsRes.ok) throw new Error("Stats API error");
        if (!rewardsRes.ok || rewardsJson.ok === false)
          throw new Error("Rewards API error");

        setStats(statsJson);
        setRewards(rewardsJson);
      } catch (e: any) {
        setError(e.message);
      }
    };

    loadAll();
  }, []);

  if (error) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.card, borderColor: "#dc2626" }}>
          <h1 style={{ color: "#dc2626" }}>❌ Error</h1>
          <p>{error}</p>
        </div>
      </main>
    );
  }

  if (!stats || !rewards) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>⏳ Loading validator data…</div>
      </main>
    );
  }

  const isActive = stats.status.toLowerCase() === "active";

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>{stats.validator}</h1>

        <div style={styles.statusRow}>
          <span
            style={{
              ...styles.dot,
              background: isActive ? "#22c55e" : "#dc2626",
            }}
          />
          <span>{stats.status.toUpperCase()}</span>
        </div>

        <p style={styles.network}>{stats.network}</p>

        <div style={styles.grid}>
          <Stat label="Total Stake" value={`${stats.stake_total} ASHM`} />
          <Stat label="Commission" value={`${stats.commission * 100}%`} />
        </div>

        <hr style={styles.hr} />

        <h2 style={styles.sub}>Rewards (24h)</h2>
        <div style={styles.reward}>+{rewards.rewards_24h} ASHM</div>
        {rewards.apr && (
          <div style={styles.apr}>APR ~ {rewards.apr.toFixed(2)}%</div>
        )}

        <div style={styles.updated}>
          Updated: {new Date(rewards.updated).toLocaleString()}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
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
    borderRadius: "18px",
    minWidth: "360px",
    border: "1px solid #1f2937",
  },
  title: { fontSize: "22px", fontWeight: "bold" },
  network: { opacity: 0.6, marginBottom: "12px" },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "8px 0",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  label: { fontSize: "12px", opacity: 0.6 },
  value: { fontSize: "16px", fontWeight: "bold" },
  hr: { margin: "20px 0", borderColor: "#1f2937" },
  sub: { fontSize: "16px", marginBottom: "6px" },
  reward: { fontSize: "24px", fontWeight: "bold", color: "#22c55e" },
  apr: { fontSize: "14px", opacity: 0.8 },
  updated: { marginTop: "12px", fontSize: "11px", opacity: 0.5 },
};
