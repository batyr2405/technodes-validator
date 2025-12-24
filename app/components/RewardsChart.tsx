"use client";

import { useEffect, useState } from "react";

type RewardPoint = {
  date: string;
  rewards: number;
};

export default function RewardsChart() {
  const [data, setData] = useState<RewardPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/rewards/history");
        const json = await res.json();

        if (json.error) {
          setError(json.error);
          return;
        }

        setData(json);
      } catch (e: any) {
        setError(e.message);
      }
    }

    load();
  }, []);

  if (error) {
    return <div className="text-red-400 text-sm mt-3">{error}</div>;
  }

  if (!data.length) {
    return <div className="skeleton h-24 w-full rounded mt-4" />;
  }

  return (
    <div className="text-xs text-gray-400 mt-3">
      Rewards history loaded ({data.length} records)
    </div>
  );
}

