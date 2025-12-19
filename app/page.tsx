"use client";

import { useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */

type Stats = {
  validator: string;
  network: string;
  status: string;
  stake_total: number;
  commission: number;
  updated: string;
};

type Rewards = {
  rewards_24h: number;
  apr: number;
  updated: string;
};

/* ---------------- PAGE ---------------- */

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const s = await fetch("/api/stats", { cache: "no-store" });
        if (!s.ok) throw new Error("stats");

        const r = await fetch("/api/rewards", { cache: "no-store" });
        if (!r.ok) throw new Error("rewards");

        setStats(await s.json());
        setRewards(await r.json());
      } catch {
        setError("Failed to load data");
      }
    };

    load();
  }, []);

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!stats || !rewards) {
    return <div style={styles.loading}>Loading…</div>;
  }

  const isActive = stats.status?.toLowerCase() === "active";

  return (
    <main style={styles.page}>
      {/* -------- VALIDATOR CARD -------- */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{stats.validator}</h1>

          {isActive && (
            <div style={styles.active}>
              <span style={styles.pulseDot} />
              ACTIVE
            </div>
          )}
        </div>

        <p style={styles.network}>{stats.network}</p>

        <div style={styles.grid}>
          <Stat
            label="Total Stake"
            value={`${format(stats.stake_total)} ASHM`}
          />
          <Stat
            label="Commission"
            value={`${Math.round((stats.commission ?? 0) * 100)} %`}
          />
        </div>

        <p style={styles.updated}>
          Updated: {new Date(stats.updated).toLocaleString()}
        </p>
      </div>

      {/* -------- REWARDS CARD -------- */}
      <div style={styles.card}>
        <p style={styles.label}>Rewards (24h)</p>

        <p style={styles.reward}>
          +{(rewards.rewards_24h ?? 0).toFixed(4)} ASHM
        </p>

        <p style={styles.apr}>
          APR (est.): {(rewards.apr ?? 0).toFixed(2)} %
        </p>

        <p style={styles.updated}>
          Updated: {new Date(rewards.updated).toLocaleString()}
        </p>
      </div>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={styles.label}>{label}</p>
      <p style={styles.value}>{value}</p>
    </div>
  );
}

/* ---------------- HELPERS ---------------- */

function format(n?: number) {
  return new Intl.NumberFormat("en-US").format(n ?? 0);
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
    padding: 40,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(145deg, #111, #0b0b0b)",
    borderRadius: 24,
    padding: 28,
    boxShadow: "0 0 40px rgba(0,0,0,0.6)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: 700,
  },

  active: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 14px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    fontWeight: 600,
    fontSize: 14,
  },

  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px rgba(34,197,94,0.9)",
    animation: "pulse 1.6s infinite",
  },

  network: {
    opacity: 0.6,
    marginBottom: 24,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 32,
  },

  label: {
    opacity: 0.6,
    fontSize: 14,
  },

  value: {
    fontSize: 18,
    fontWeight: 600,
  },

  reward: {
    fontSize: 36,
    fontWeight: 700,
    color: "#86efac",
    marginTop: 12,
  },

  apr: {
    marginTop: 8,
    fontSize: 16,
  },

  updated: {
    marginTop: 20,
    opacity: 0.5,
    fontSize: 13,
  },

  loading: {
    color: "#aaa",
    padding: 60,
  },

  error: {
    color: "#f87171",
    padding: 60,
  },
};
