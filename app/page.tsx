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

type RewardPoint = {
  date: string;
  rewards: number;
};

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [history, setHistory] = useState<RewardPoint[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const s = await fetch("/api/stats", { cache: "no-store" });
        if (!s.ok) throw new Error("stats failed");
        setStats(await s.json());

        const r = await fetch("/api/rewards", { cache: "no-store" })
          { cache: "no-store" }
        );
        if (r.ok) setHistory(await r.json());
      } catch {
        setError("Failed to load data");
      }
    }
    load();
  }, []);

  if (error) return <ErrorBox text={error} />;
  if (!stats) return <Loading />;

  const isActive = stats.status.toLowerCase() === "active";
  const apr =
    stats.stake_total > 0
      ? (stats.rewards_24h * 365 * 100) / stats.stake_total
      : 0;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>{stats.validator}</h1>
          <span style={styles.statusWrap}>
            <span
              style={{
                ...styles.dot,
                background: isActive ? "#22c55e" : "#ef4444",
              }}
            />
            {stats.status.toUpperCase()}
          </span>
        </div>

        <p style={styles.network}>{stats.network}</p>

        {/* STATS GRID */}
        <div style={styles.grid}>
          <Stat label="Total Stake" value={`${fmt(stats.stake_total)} ASHM`} />
          <Stat label="Commission" value={`${(stats.commission * 100).toFixed(0)} %`} />
          <Stat label="Rewards (24h)" value={`+${stats.rewards_24h.toFixed(4)} ASHM`} />
          <Stat label="APR (est.)" value={`${apr.toFixed(2)} %`} />
        </div>

        {/* REWARDS */}
        <h2 style={styles.sub}>Rewards</h2>
        <RewardsChart data={history} />

        {/* HEALTH */}
        <h2 style={styles.sub}>Validator Health</h2>
        <div style={styles.grid}>
          <Stat label="Uptime (30d)" value="99.98%" />
          <Stat label="Slashing" value="None" />
        </div>

        <p style={styles.updated}>
          Updated {new Date(stats.updated).toLocaleString()}
        </p>
      </div>

      {/* animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,.6); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </main>
  );
}

/* ---------- helpers ---------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <strong style={styles.value}>{value}</strong>
    </div>
  );
}

function RewardsChart({ data }: { data: RewardPoint[] }) {
  if (!data || data.length < 2) return <p>No reward history yet</p>;

  const max = Math.max(...data.map(d => d.rewards));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.rewards / max) * 100;
    return `${x},${y}`;
  });

  return (
    <svg viewBox="0 0 100 100" width="100%" height="90">
      <polyline
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        points={points.join(" ")}
      />
    </svg>
  );
}

function Loading() {
  return <div style={styles.center}>Loading…</div>;
}

function ErrorBox({ text }: { text: string }) {
  return <div style={{ ...styles.center, color: "#ef4444" }}>{text}</div>;
}

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

/* ---------- styles ---------- */

const styles: any = {
  page: {
    minHeight: "100vh",
    background: "#0b0f14",
    color: "#e5e7eb",
    display: "flex",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    maxWidth: 520,
    width: "100%",
    background: "#0f172a",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 40px rgba(0,0,0,.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 24, fontWeight: 700 },
  statusWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 600,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    animation: "pulse 1.5s infinite",
  },
  network: {
    opacity: 0.7,
    marginBottom: 16,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
    marginBottom: 20,
  },
  stat: {
    background: "#020617",
    borderRadius: 12,
    padding: 12,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
  },
  value: {
    display: "block",
    fontSize: 16,
    marginTop: 4,
  },
  sub: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 600,
  },
  updated: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.5,
    textAlign: "right",
  },
  center: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
};
