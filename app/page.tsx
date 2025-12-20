"use client";

import { useEffect, useState } from "react";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
  updated: string;
};

type Rewards = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch("/api/stats", { cache: "no-store" });
        if (!s.ok) throw new Error("stats");
        setStats(await s.json());

        const r = await fetch("/api/rewards", { cache: "no-store" });
        if (!r.ok) throw new Error("rewards");
        setRewards(await r.json());
      } catch {
        setError("Failed to load data");
      }
    };

    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  if (error) {
    return <main style={{ padding: 40, color: "#f87171" }}>{error}</main>;
  }

  if (!stats || !rewards) {
    return <main style={{ padding: 40, color: "#aaa" }}>Loading…</main>;
  }

  const isActive = stats.status.toLowerCase() === "active";

  return (
    <main style={styles.page}>
      {/* INTRO */}
      <div style={styles.intro}>
        <h1 style={styles.welcome}>Welcome 👋</h1>
        <p style={styles.text}>
          You are viewing the public dashboard of <b>TechNodes-01</b> validator.
        </p>
        <p style={styles.text}>
          This page shows <b>only real data from my own node</b> — no averages, no assumptions.
        </p>
        <p style={styles.text}>
          Track real rewards, uptime and performance in the Shardeum network.
        </p>
      </div>

      {/* VALIDATOR CARD */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>TechNodes-01</h2>
            <div style={styles.sub}>Shardeum</div>
          </div>

          <div style={styles.status}>
            <span style={{ ...styles.dot, animation: "pulse 1.5s infinite" }} />
            ACTIVE
          </div>
        </div>

        <div style={styles.grid}>
          <div>
            <div style={styles.label}>Total Stake</div>
            <div style={styles.value}>
              {stats.stake_total.toLocaleString()} ASHM
            </div>
          </div>

          <div>
            <div style={styles.label}>Commission</div>
            <div style={styles.value}>
              {(stats.commission * 100).toFixed(0)} %
            </div>
          </div>
        </div>

        <div style={styles.updated}>
          Updated: {new Date(stats.updated).toLocaleString()}
        </div>
      </div>

      {/* REWARDS CARD */}
      <div style={styles.card}>
        <div style={styles.label}>Rewards (24h)</div>

        <div style={styles.reward}>
          +{rewards.rewards_24h.toFixed(4)} ASHM
        </div>

        <div style={styles.value}>
          APR (est.): {rewards.apr.toFixed(2)} %
        </div>

        <div style={styles.updated}>
          Updated: {new Date(rewards.updated).toLocaleString()}
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    padding: "60px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
  },

  intro: {
    maxWidth: 720,
    textAlign: "center",
    color: "#ccc",
  },

  welcome: {
    fontSize: 36,
    marginBottom: 16,
    color: "#fff",
  },

  text: {
    marginBottom: 8,
    lineHeight: 1.6,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(180deg,#111,#0b0b0b)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  sub: {
    color: "#aaa",
  },

  status: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#22c55e",
    fontWeight: 600,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginBottom: 16,
  },

  label: {
    color: "#aaa",
    marginBottom: 4,
  },

  value: {
    fontSize: 18,
    fontWeight: 600,
  },

  reward: {
    fontSize: 32,
    fontWeight: 700,
    color: "#86efac",
    margin: "12px 0",
  },

  updated: {
    color: "#666",
    fontSize: 13,
    marginTop: 12,
  },
};
