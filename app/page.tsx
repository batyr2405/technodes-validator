// app/page.tsx
import RewardsCard from "./components/RewardsCard";

export const dynamic = "force-dynamic";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
  updated: string;
};

export default async function Page() {
  const res = await fetch(
    "https://technodes-validator.vercel.app/api/stats",
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to load stats");
  }

  const data: Stats = await res.json();

  const isActive = data.status?.toLowerCase() === "active";

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">

        {/* Validator card */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">{data.validator}</h1>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold
                ${isActive ? "bg-green-600 animate-pulse" : "bg-red-600"}
              `}
            >
              {data.status?.toUpperCase()}
            </span>
          </div>

          <div className="text-sm text-neutral-400">
            {data.network}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 text-sm">
            <div>
              <div className="text-neutral-400">Total Stake</div>
              <div className="font-mono">
                {data.stake_total.toLocaleString()} ASHM
              </div>
            </div>

            <div>
              <div className="text-neutral-400">Commission</div>
              <div className="font-mono">
                {(data.commission * 100).toFixed(0)} %
              </div>
            </div>
          </div>

          <div className="text-xs text-neutral-500 pt-2">
            Updated: {new Date(data.updated).toLocaleString()}
          </div>
        </div>

        {/* Rewards block (Client Component) */}
        <RewardsCard />

      </div>
    </main>
  );
}
