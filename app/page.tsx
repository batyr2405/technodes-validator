"use client";

import { useEffect, useState } from "react";

/* =========================================================
   PAGE
========================================================= */
export default function Page() {
  /* -----------------------------
     STATE
  ----------------------------- */
  const [rewards, setRewards] = useState<any>(null);
  const [rewardsError, setRewardsError] = useState<string | null>(null);

  /* -----------------------------
     LOAD REWARDS
  ----------------------------- */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");

      const data = await res.json();
      setRewards(data);
      setRewardsError(null);
    } catch {
      setRewardsError("Failed to load rewards");
    }
  };

  /* -----------------------------
     AUTO REFRESH (30s)
  ----------------------------- */
  useEffect(() => {
    loadRewards();
    const i = setInterval(loadRewards, 30_000);
    return () => clearInterval(i);
  }, []);

  /* -----------------------------
     SAFE VALUES (NO CRASH)
  ----------------------------- */
  const reward24h =
    typeof rewards?.rewards_24h === "number" ? rewards.rewards_24h : 0;

  const apr =
    typeof rewards?.apr === "number" ? rewards.apr : 0;

  const updatedRewards =
    rewards?.updated ? new Date(rewards.updated).toLocaleString() : "—";

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <main style={styles.page}>
      {/* =====================================================
          INTRO
      ===================================================== */}
      <div style={styles.intro}>
        <h1 style={styles.title}>Welcome 👋</h1>
        <p style={styles.text}>
          You are viewing the public dashboard of{" "}
          <strong>TechNodes-01</strong> validator.
        </p>
        <p style={styles.text}>
          This page shows <strong>only real data from my own node</strong> —
          no averages, no assumptions.
        </p>
        <p style={styles.text}>
          Track real rewards, uptime and performance in the Shardeum network.
        </p>
      </div>

      {/* =====================================================
          VALIDATOR CARD
      ===================================================== */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h2 style={styles.cardTitle}>TechNodes-01</h2>
            <div style={styles.sub}>Shardeum</div>
          </div>

          {/* ACTIVE BADGE */}
          <div style={styles.activeBadge}>
            <span style={styles.pulse} />
            ACTIVE
          </div>
        </div>

        <div style={styles.grid}>
          <div>
            <div style={styles.label}>Total Stake</div>
            <div style={styles.value}>441 184 ASHM</div>
          </div>

          <div>
            <div style={styles.label}>Commission</div>
            <div style={styles.value}>9 %</div>
          </div>
        </div>

        <div style={styles.updated}>
          Updated: 18.12.2025, 14:09:18
        </div>
      </div>

      {/* =====================================================
          REWARDS CARD
      ===================================================== */}
      <div style={styles.card}>
        <div style={styles.label}>Rewards (24h)</div>

        {rewardsError ? (
          <div style={styles.error}>{rewardsError}</div>
        ) : (
          <>
            <div style={styles.reward}>
              +{reward24h.toFixed(4)} ASHM
            </div>

            <div style={styles.value}>
              APR (est.): {apr.toFixed(2)} %
            </div>

            <div style={styles.updated}>
              Updated: {updatedRewards}
              <br />
              Auto-updated every 30 seconds
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* =========================================================
   STYLES
========================================================= */
const styles: any = {
  page: {
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #111, #000)",
    color: "#fff",
    padding: "60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 32,
  },

  intro: {
    maxWidth: 720,
    textAlign: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 36,
    marginBottom: 12,
  },

  text: {
    color: "#ccc",
    lineHeight: 1.6,
    marginBottom: 6,
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "linear-gradient(180deg, #1a1a1a, #0e0e0e)",
    borderRadius: 20,
    padding: 28,
    boxShadow: "0 20px 40px rgba(0,0,0,.6)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 28,
    marginBottom: 4,
  },

  sub: {
    color: "#aaa",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginTop: 20,
  },

  label: {
    color: "#aaa",
    marginBottom: 6,
  },

  value: {
    fontSize: 18,
  },

  reward: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#7CFFA6",
    marginBottom: 10,
  },

  updated: {
    marginTop: 12,
    fontSize: 13,
    color: "#777",
  },

  error: {
    color: "#ff6b6b",
    fontSize: 14,
  },

  /* ACTIVE BADGE */
  activeBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#1f7a3f",
    padding: "6px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "bold",
  },

  pulse: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#4ade80",
    boxShadow: "0 0 0 rgba(74,222,128,0.7)",
    animation: "pulse 1.6s infinite",
  },
};

/* =========================================================
   PULSE ANIMATION (INLINE)
========================================================= */
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(74,222,128,.7); }
      70% { box-shadow: 0 0 0 12px rgba(74,222,128,0); }
      100% { box-shadow: 0 0 0 0 rgba(74,222,128,0); }
    }
  `;
  document.head.appendChild(style);
}
