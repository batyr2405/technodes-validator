"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
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

  useEffect(() => {
    fetch("/api/rewards/history", { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then(setData)
      .catch(() => setError("Failed to load rewards history"));
  }, []);

  if (error) {
    return <div className="text-sm text-gray-500 mt-3">{error}</div>;
  }

  if (!data.length) {
    return <div className="skeleton h-40 rounded mt-4" />;
  }

  return (
    <div className="h-40 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
           <XAxis
             dataKey="date"
             tick={{ fill: "#9ca3af", fontSize: 12 }}
             label={{
               value: "Rewards history (Date)",
               position: "insideBottom",
               offset: -5,
               fill: "#9ca3af",
               fontSize: 12,
             }}
           />

           <YAxis
             tick={{ fill: "#9ca3af", fontSize: 12 }}
             width={60}
             label={{
               value: "Total SHM",
               angle: -90,
               position: "insideLeft",
               fill: "#9ca3af",
               fontSize: 12,
             }}
           />

          <Tooltip
            contentStyle={{
              backgroundColor: "#020617",
              border: "1px solid #1f2937",
              borderRadius: 8,
            }}
            formatter={(v: any) => [`${Number(v).toFixed(4)} SHM`, "Rewards"]}
            labelFormatter={(d: any) => `Date: ${d}`}
          />        

          <Line
            type="monotone"
            dataKey="rewards"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
