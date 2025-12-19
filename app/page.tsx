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
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetch("http://62.84.177.12/stats.json", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch stats");

      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    loadStats(); // сразу при загрузке

    const timer = setInterval(loadStats, 30_000); // каждые 30 сек
    return () => clearInterval(timer);
  }, []);

  if (error) {
    return <div style={styles.page}>❌ {error}</div>;
  }

  if (!data) {
    return <div style={styles.page}>⏳ Loading…</div>;
  }

  const apr =
    data.stake_total > 0
      ? (data.rewards_24h * 365 * 100) / data.stake_total
      : 0;

  const isActive = data.status.toLowerCase() === "active";

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{data.validator}</h1>

          <span
            style={{
              ...styles.status,
              backgroundColor: isActive ? "#16a34a" : "#dc2626",
            }}
          >
            {data.status.toUpperCase()}
          </span>
        </div>

        <p style={styles.network}>{data.network}</p>

        <div style={styles.grid}>
          <Stat label="Total Stake" value={`${data.stake_total.toLocaleString()} ASHM`} />
          <Stat label="Commission" value={`${(data.commission * 100).toFixed(0)} %`} />
          <Stat label="Rewards (24h)" value={`+${data.rewards_24h.toFixed(4)} ASHM`} />
          <Stat label="APR (est.)" value={`${apr.toFixed(2)} %`} />
        </div>

        <p style={styles.updated}>
          Updated: {new Date(data.updated).toLocaleString()}
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc",
    fontFamily: "system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    width: 420,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
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
  status: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
  },
  network: {
    marginTop: 8,
    color: "#64748b",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    marginTop: 24,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  statValue: {
    fontSize: 18,
    fontWeight: 600,
  },
  updated: {
    marginTop: 24,
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "right",
  },
};
