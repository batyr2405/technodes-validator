"use client";

import { useEffect, useState } from "react";

type Stats = {
  validator?: string;
  network?: string;
  status?: string;
  stake_total?: number;
  commission?: number;
  updated?: string;
};

type Rewards = {
  rewards_24h?: number;
  apr?: number;
  updated?: string;
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch("/api/stats", { cache: "no-store" });
        if (!s.ok) throw new Error("stats failed");
        const statsData = await s.json();
        setStats(statsData ?? {});

        const r = await fetch("/api/rewards", { cache: "no-store" });
        if (!r.ok) throw new Error("rewards failed");
        const rewardsData = await r.json();
        setRewards(rewardsData ?? {});
      } catch {
        setError("Failed to load data");
      }
    };

    load();
  }, []);

  /* ---------- SAFE VALUES ---------- */
  const stake = Number(stats?.stake_total ?? 0);
  const commission = Number(stats?.commission ?? 0);
  const rewards24h = Number(rewards?.rewards_24h ?? 0);
  const apr = Number(rewards?.apr ?? 0);

  return (
    <main style={styles.page}>
      <section style={styles.intro}>
        <h1 style={styles.welcome}>Welcome 👋</h1>
        <p>
          You are viewing the public dashboard of{" "}
          <b>TechNodes-01</b> validator.
        </p>
        <p>
          This page shows <b>only real data from my own node</b> —
          no averages, no assumptions.
        </p>
        <p>
          Track real rewards, uptime and performance in the Shardeum network.
        </p>
      </section>

      {error && <p style={styles.error}>{error}</p>}

      {stats && (
        <section style={styles.card}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>{stats.validator ?? "TechNodes-01"}</h2>
              <p style={styles.network}>{stats.network ?? "Shardeum"}</p>
            </div>

            <div style={styles.status}>
              <span style={styles.pulse} />
              ACTIVE
            </div>
          </div>

          <div style={styles.grid}>
            <div>
              <div style={styles.label}>Total Stake</div>
              <div style={styles.value}>
                {stake.toLocaleString()} ASHM
              </div>
            </div>

            <div>
              <div style={styles.label}>Commission</div>
              <div style={styles.value}>
                {(commission * 100).toFixed(0)} %
              </div>
            </div>
          </div>

          <div style={styles.updated}>
            Updated:{" "}
            {stats.updated
              ? new Date(stats.updated).toLocaleString()
              : "—"}
          </div>
        </section>
      )}

      {rewards && (
        <section style={styles.card}>
          <div style={styles.label}>Rewards (24h)</div>
          <div style={styles.rewards}>
            +{rewards24h.toFixed(4)} ASHM
          </div>
          <div style={styles.apr}>
            APR (est.): {apr.toFixed(2)} %
          </div>
          <div style={styles.updated}>
            Updated:{" "}
            {rewards.updated
              ? new Date(rewards.updated).toLocaleString()
              : "—"}
          </div>
        </section>
      )}
    </main>
  );
}

/* ================= STYLES ================= */

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    padding: "40px 16px",
    background: "radial-gradient(circle at top, #111, #000)",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },

  intro: {
    maxWidth: 720,
    margin: "0 auto 40px",
    textAlign: "center",
    color: "#ccc",
    lineHeight: 1.6,
  },

  welcome: {
    fontSize: 32,
    marginBottom: 16,
    color: "#fff",
  },

  card: {
    maxWidth: 720,
    margin: "0 auto 24px",
    padding: 24,
    borderRadius: 20,
    background: "linear-gradient(180deg, #1b1b1b, #0f0f0f)",
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
    margin: 0,
  },

  network: {
    color: "#aaa",
    marginTop: 4,
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 14px",
    borderRadius: 999,
    backgroundColor: "#16a34a",
    fontWeight: 700,
    fontSize: 12,
  },

  pulse: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "#22c55e",
    animation: "pulse 1.5s infinite",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  label: {
    color: "#aaa",
    marginBottom: 6,
  },

  value: {
    fontSize: 22,
    fontWeight: 600,
  },

  rewards: {
    fontSize: 28,
    fontWeight: 700,
    color: "#86efac",
    marginBottom: 8,
  },

  apr: {
    fontSize: 16,
  },

  updated: {
    marginTop: 16,
    fontSize: 12,
    color: "#777",
  },

  error: {
    textAlign: "center",
    color: "#f87171",
    marginBottom: 24,
  },
};
