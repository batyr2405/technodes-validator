"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";

type Point = {
  date: string;
  rewards: number;
};

export default function RewardsChart() {
  const [data, setData] = useState<Point[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/rewards/history", { cache: "no-store" });
      const json = await res.json();

      if (json.error) throw new Error(json.error);

      setData(json);
    } catch (e: any) {
      setError(e.message || "Failed to load rewards history");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-6 shadow-lg mt-6">
      <div className="text-sm text-gray-400 mb-3">Rewards history</div>

      {error && <div className="text-red-400 text-sm">{error}</div>}

      {!data.length && !error && (
        <div className="skeleton h-40 w-full rounded" />
      )}

      {data.length > 0 && (
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="rewards"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
