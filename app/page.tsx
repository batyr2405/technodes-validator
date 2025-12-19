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
<div style={styles.intro}>
  <p style={styles.introTitle}>Welcome 👋</p>

  <p style={styles.introText}>
    You are viewing the public dashboard of <b>TechNodes-01</b> validator.
  </p>

  <p style={styles.introText}>
    Unlike aggregator sites, this page shows <b>only real data from my own node</b> —
    no averages, no estimates, no hidden assumptions.
  </p>

  <p style={styles.introText}>
    Here you can see how much this validator actually earns and how it performs
    in the Shardeum network.
  </p>
</div>




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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #111 0%, #000 60%)",
    padding: "48px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
    color: "#fff",
    fontFamily: "Inter, system-ui, sans-serif",
  },

  intro: {
    maxWidth: 720,
    marginBottom: 12,
    color: "#ccc",
    lineHeight: 1.6,
    textAlign: "center",
  },

  introTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 12,
    color: "#fff",
  },

  introText: {
    fontSize: 15,
    marginBottom: 8,
    opacity: 0.9,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(180deg, #1a1a1a, #111)",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: 800,
  },

  status: {
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: "#16a34a",
    color: "#fff",
    position: "relative",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 16,
  },

  label: {
    fontSize: 13,
    opacity: 0.7,
  },

  value: {
    fontSize: 18,
    fontWeight: 600,
  },
};
