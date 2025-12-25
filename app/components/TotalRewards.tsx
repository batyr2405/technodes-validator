"use client";

import { useEffect, useState } from "react";

type Row = {
  date: string;
  rewards: number;
};

export default function TotalRewards() {
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/rewards/history", { cache: "no-store" });
        const data: Row[] = await res.json();

        const sum = data.reduce((a, r) => a + r.rewards, 0);
        setTotal(sum);
      } catch (e: any) {
        setError("Failed to load total rewards");
      }
    }

    load();
  }, []);

  return (
    <div>
      {error && <div className="text-red-400 text-sm mt-2">{error}</div>}

      {total === null && !error && (
        <div className="skeleton h-8 w-32 rounded mt-2" />
      )}

      {total !== null && (
        <div className="text-3xl font-bold text-blue-400 mt-2">
          {total.toFixed(4)} ASHM
        </div>
      )}
    </div>
  );
}
