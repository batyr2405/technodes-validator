export const dynamic = "force-dynamic";

type Stats = {
  validator: string;
  network: string;
  status: string;
  commission: number;
  stake_total: number;
  rewards_24h: number;
  updated: string;
};

function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export default async function Home() {
  const res = await fetch("http://62.84.177.12/stats.json", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load stats");
  }

  const data: Stats = await res.json();

  const apr =
    data.stake_total > 0
      ? (data.rewards_24h * 365 * 100) / data.stake_total
      : 0;

  const isActive = data.status.toLowerCase() === "active";

  return (
    <main style={{ padding: 40, fontFamily: "system-ui" }}>
      <div
        style={{
          maxWidth: 520,
          margin: "0 auto",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h1 style={{ fontSize: 24 }}>{data.validator}</h1>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              color: "#fff",
              background: isActive ? "#16a34a" : "#dc2626",
              fontSize: 12,
            }}
          >
            {data.status.toUpperCase()}
          </span>
        </div>

        <p style={{ color: "#6b7280", marginBottom: 20 }}>{data.network}</p>

        <div style={{ display: "grid", gap: 12 }}>
          <Stat label="Total Stake" value={`${formatNumber(data.stake_total)} ASHM`} />
          <Stat label="Commission" value={`${(data.commission * 100).toFixed(0)} %`} />
          <Stat label="Rewards (24h)" value={`+${data.rewards_24h.toFixed(4)} ASHM`} />
          <Stat label="APR (est.)" value={`${apr.toFixed(2)} %`} />
          <Stat label="Updated" value={new Date(data.updated).toLocaleString()} />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
