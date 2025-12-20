"use client";

import { useEffect, useState } from "react";

/* =========================
   TYPES
========================= */
type RewardsResponse = {
  rewards_24h: number;
  updated: string;
};

/* =========================
   PAGE
========================= */
export default function Page() {
  const [rewards, setRewards] = useState<RewardsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* =========================
     LOAD REWARDS
  ========================= */
  const loadRewards = async () => {
    try {
      const res = await fetch("/api/rewards", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();

      setRewards({
        rewards_24h: Number(data.rewards_24h) || 0,
        updated: data.updated,
      });

      setError(null);
    } catch {
      setError("Failed to load rewards");
    }
  };

  /* =========================
     AUTO UPDATE (30s)
  ========================= */
  useEffect(() => {
    loadRewards();
    const timer = setInterval(loadRewards, 30_000);
    return () => clearInterval(timer);
  }, []);

  /* =========================
     APR CALC
  ========================= */
  const stakeTotal = 441_184;
  const apr =
    rewards && rewards.rewards_24h
      ? (rewards.rewards_24h * 365 * 100) / stakeTotal
      : 0;

  /* =========================
     RENDER
  ========================= */
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px" }}>
      {/* =========================
         HEADER
      ========================= */}
      <div className="card" style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700 }}>TechNodes-01</h1>

        <div className="status" style={{ marginTop: 8 }}>
          <span className="status-dot" />
          ACTIVE
        </div>

        <p className="muted" style={{ marginTop: 12, maxWidth: 720 }}>
          You are viewing the live dashboard of <b>TechNodes-01</b> — a
          professionally operated Shardeum validator.
          <br />
          This page shows <b>real-time rewards, APR and validator status</b>,
          transparently and without aggregation.
        </p>
      </div>

      {/* =========================
         GRID
      ========================= */}
      <div className="grid">
        {/* ---------- REWARDS ---------- */}
        <div className="card">
          <div className="label">Rewards (24h)</div>

          <div className="value-big">
            {rewards ? `+${rewards.rewards_24h.toFixed(4)}` : "—"} ASHM
          </div>

          <div className="value">
            APR (est.): {apr.toFixed(2)} %
          </div>

          <div className="muted">
            Updated:{" "}
            {rewards
              ? new Date(rewards.updated).toLocaleString()
              : "—"}
          </div>

          <div className="muted">Auto-updated every 30 seconds</div>

          {error && (
            <div className="muted" style={{ color: "#f87171" }}>
              {error}
            </div>
          )}
        </div>

        {/* ---------- STAKE ---------- */}
        <div className="card">
          <div className="label">Total Stake</div>
          <div className="value-big">441,184 ASHM</div>
          <div className="muted">Delegated to TechNodes-01</div>
        </div>

        {/* ---------- COMMISSION ---------- */}
        <div className="card">
          <div className="label">Commission</div>
          <div className="value-big">9 %</div>
          <div className="muted">Validator fee</div>
        </div>
      </div>
    </main>
  );
}
