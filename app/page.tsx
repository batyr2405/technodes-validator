import RewardsCard from "./components/RewardsCard";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
  updated: string;
};

export const dynamic = "force-dynamic";

async function getStats(): Promise<Stats> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load stats");
  }

  return res.json();
}

export default async function Page() {
  const data = await getStats();

  const isActive = data.status.toLowerCase() === "active";

  return (
    <main className="min-h-screen bg-black text-white flex justify-center p-6">
      <div className="w-full max-w-xl space-y-6">
        {/* ================= MAIN CARD ================= */}
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{data.validator}</h1>

            <div className="relative flex items-center justify-center">
              <span
                className={`absolute inline-flex h-3 w-3 rounded-full ${
                  isActive ? "bg-green-500 animate-ping" : "bg-red-500"
                }`}
              />
              <span
                className={`relative inline-flex h-3 w-3 rounded-full ${
                  isActive ? "bg-green-500" : "bg-red-500"
                }`}
              />
            </div>
          </div>

          <p className="text-zinc-400">{data.network}</p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <Stat label="Status" value={data.status.toUpperCase()} />
            <Stat label="Commission" value={`${(data.commission * 100).toFixed(0)} %`} />
            <Stat
              label="Total Stake"
              value={`${new Intl.NumberFormat("en-US").format(data.stake_total)} ASHM`}
            />
            <Stat
              label="Updated"
              value={new Date(data.updated).toLocaleString()}
            />
          </div>
        </div>

        {/* ================= REWARDS BLOCK ================= */}
        <RewardsCard />
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
