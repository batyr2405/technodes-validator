import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

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

function moscowTimeLabel(dateLike: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Moscow",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(dateLike));

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.hour}:${values.minute}`;
}

export async function GET() {
  try {
    const res = await fetch("http://62.84.177.12/rewards.csv", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch rewards.csv");

    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);

    const todayMsk = moscowDateKey(new Date().toISOString());

    const totals = lines
      .map((line) => {
        const [date, raw] = line.split(",");
        if (!date || !raw) return null;

        const value = raw.trim();
        const num = parseFloat(value.startsWith(".") ? `0${value}` : value);
        if (!Number.isFinite(num)) return null;

        return {
          date,
          total: num > 1e10 ? num / 1e18 : num,
        };
      })
      .filter(
        (row): row is { date: string; total: number } =>
          row != null && moscowDateKey(row.date) === todayMsk
      );

    const baseline = totals[0]?.total ?? 0;

const data = totals
  .map((row) => {
    return {
      date: moscowTimeLabel(row.date),
      rewards: Math.max(row.total - baseline, 0),
    };
  })
  .filter((r) => Number.isFinite(r.rewards));

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
