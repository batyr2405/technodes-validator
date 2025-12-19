"use client";

import { useEffect, useState } from "react";

type Rewards = {
  rewards_24h?: number;
  apr?: number;
  updated?: string;
};

export default function Page() {
  const [data, setData] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/rewards", { cache: "no-store" });
        if (!res.ok) throw new Error("API error");

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setError("Failed to load rewards");
      }
    };

    load();
  }, []);

  const rewards =
    typeof data?.rewards_24h === "number"
      ? data.rewards_24h.toFixed(4)
      : "—";

  const apr =
    typeof data?.apr === "number"
      ? data.apr.toFixed(2) + " %"
      : "—";

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>TechNodes Validator</h1>

          <div style={styles.active}>
            <span style={styles.dot} />
            ACTIVE
          </div>
        </header>

        {error && <p style={styles.error}>{error}</p>}
        {!error && !data && <p style={styles.loading}>Loading…</p>}

        <Stat label="Rewards (24h)" value={rewards + " ASHM"} />
        <Stat label="APR (est.)" value={apr} />

        {data?.updated && (
          <p style={styles.updated}>
            Updated: {new Date(data.updated).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

const styles: Record<string, any> = {
  page: {
    minHeight: "100vh",
    background: "#0b0f1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },
  card: {
    width: 380,
    background: "#121826",
    padding: 24,
    borderRadius: 14,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: 600 },
  active: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#22c55e",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 10px #22c55e",
    animation: "pulse 1.5s infinite",
  },
  stat: {
    display: "flex",
    justifyContent: "space-between",
    background: "#0e1424",
    padding: "10px 14px",
    borderRadius: 10,
    marginTop: 10,
  },
  label: { color: "#9ca3af" },
  value: { fontFamily: "monospace" },
  updated: {
    marginTop: 12,
    fontSize: 11,
    color: "#6b7280",
  },
  error: { color: "#f87171" },
  loading: { color: "#9ca3af" },
};
