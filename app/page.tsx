import fs from "fs/promises";
import path from "path";

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

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export const revalidate = 60; // авто-обновление каждые 60 сек

export default async function Home() {
  const filePath = path.join(process.cwd(), "public", "stats.json");
  const file = await fs.readFile(filePath, "utf-8");
  const data: Stats = JSON.parse(file);
  const apr =
  data.stake_total > 0
    ? (data.rewards_24h * 365 * 100) / data.stake_total
    : 0;

  const isActive = data.status.toLowerCase() === "active";

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>{data.validator}</h1>
          <span
            style={{
              ...styles.status,
              backgroundColor: isActive ? "#16a34a" : "#dc2626",
            }}
          >
            {data.status.toUpperCase()}
          </span>
        </div>

        <p style={styles.network}>{data.network}</p>

        <div style={styles.grid}>
          <Stat label="Total Stake" value={`${formatNumber(data.stake_total)} ASHM`} />
          <Stat label="Commission" value={`${(data.commission * 100).toFixed(0)} %`} />
          <Stat label="Rewards (24h)" value={`+${data.rewards_24h.toFixed(4)} ASHM`} />
          <Stat label="APR (est.)" value={`${apr.toFixed(2)} %`} />
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={styles.label}>{label}</div>
      <div style={styles.value}>{value}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#e5e7eb",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  card: {
    background: "#020617",
    padding: 32,
    borderRadius: 16,
    width: 380,
    boxShadow: "0 20px 40px rgba(0,0,0,.4)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
  },
  status: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
  },
  network: {
    marginTop: 6,
    color: "#94a3b8",
  },
  grid: {
    marginTop: 24,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },
  label: {
    fontSize: 12,
    color: "#94a3b8",
  },
  value: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 500,
  },
};
