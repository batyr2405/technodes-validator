import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const DAILY_URL = "http://technodes.duckdns.org/rewards_daily.csv";
const CURRENT_URL = "http://technodes.duckdns.org/rewards.csv";

function moscowDateKey(dateLike: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(dateLike));

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function displayDate(dateKey: string): string {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}`;
}

function parseAttoOrShm(value: string): number | null {
  const num = parseFloat(value.trim().startsWith(".") ? `0${value.trim()}` : value);
  if (!Number.isFinite(num)) return null;
  return num > 1e10 ? num / 1e18 : num;
}

function currentDayReward(csvText: string): { date: string; rewards: number } | null {
  const lines = csvText.trim().split("\n").slice(1);
  const today = moscowDateKey(new Date().toISOString());

  const totals = lines
    .map((line) => {
      const [date, raw] = line.split(",");
      if (!date || !raw || moscowDateKey(date) !== today) return null;

      const total = parseAttoOrShm(raw);
      return total == null ? null : { date, total };
    })
    .filter((row): row is { date: string; total: number } => row != null);

  if (totals.length < 2) return null;

  return {
    date: today,
    rewards: Math.max(totals[totals.length - 1].total - totals[0].total, 0),
  };
}

export async function GET() {
  try {
    const [dailyRes, currentRes] = await Promise.all([
      fetch(DAILY_URL, { cache: "no-store" }),
      fetch(CURRENT_URL, { cache: "no-store" }),
    ]);

    if (!dailyRes.ok || !currentRes.ok) {
      throw new Error("failed to fetch rewards history");
    }

    const dailyText = await dailyRes.text();
    const currentText = await currentRes.text();

    const dailyRows = dailyText
      .trim()
      .split("\n")
      .slice(1)
      .map((line) => {
        const [date, raw] = line.split(",");
        if (!date || !raw) return null;

        const rewards = parseAttoOrShm(raw);
        if (rewards == null) return null;

        return {
          date,
          rewards,
        };
      })
      .filter(
        (row): row is { date: string; rewards: number } =>
          row != null && Number.isFinite(row.rewards)
      );

    const today = currentDayReward(currentText);
    const rows = today
      ? [...dailyRows.filter((row) => row.date !== today.date), today]
      : dailyRows;

    const data = rows
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map((row) => ({
        date: displayDate(row.date),
        rewards: row.rewards,
      }));

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
