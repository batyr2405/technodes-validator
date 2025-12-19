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

function minutesAgo(date: string) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60000);
}

function getStatus(data: Stats) {
  const mins = minutesAgo(data.updated);

  if (mins <= 5) return "ACTIVE";
  if (mins <= 30) return "SYNCING";
  return "INACTIVE";
}

export default async function Page() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_STATS_URL}/api/stats`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>❌ Failed to load data</div>
      </main>
    );
  }

  const data: Stats = await res.json();
  const status = getStatus(data);

  const apr =
    data.stake_total > 0
      ? (data.rewards_24h * 365 * 100) / data.stake_total
      : 0;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{data.validator}</h1>

          <div style={styles.statusWrap}>
            <span
              style={{
                ...styles.statusDot,
                ...statusStyles[status],
              }}
            />
            <span style={{ fontWeight: 600 }}>{status}</span>
          </div>
        </div>

        <p style={styles.network}>{data.network}</p>

        {/* Stats */}
        <div style={styles.grid}>
          <Stat label="Total Stake" value={`${formatNumber(data.stake_total)} ASHM`} />
          <Stat label="Commission" value={`${(data.commission * 100).toFixed(0)} %`} />
          <Stat label="Rewards (24h)" value={`+${data.rewards_24h.toFixed(4)} ASHM`} />
          <Stat label="APR (est.)" value={`${apr.toFixed(2)} %`} />
        </div>

        <p style={styles.updated}>
          Updated {minutesAgo(data.updated)} min ago
        </p>
      </div>

      {/* Animations */}
      <style>{keyframes}</style>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0b0f14",
    color: "#e5e7eb",
    fontFamily: "system-ui",
  },
  card: {
    width: 420,
    background: "#111827",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
  },
  network: {
    opacity: 0.6,
    marginBottom: 16,
  },
  statusWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 16,
  },
  stat: {
    background: "#020617",
    padding: 12,
    borderRadius: 10,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 600,
  },
  updated: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.5,
    textAlign: "center" as const,
  },
};

const statusStyles: Record<string, any> = {
  ACTIVE: {
    backgroundColor: "#16a34a",
    animation: "pulse 1.5s infinite",
  },
  SYNCING: {
    backgroundColor: "#facc15",
    animation: "blink 1.2s infinite",
  },
  INACTIVE: {
    backgroundColor: "#6b7280",
  },
};

const keyframes = `
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.7); }
  70% { box-shadow: 0 0 0 12px rgba(22,163,74,0); }
  100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
}

@keyframes blink {
  0%,100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;
