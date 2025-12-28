import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch("http://62.84.177.12/rewards.csv", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch rewards.csv");

    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);

    // парсим как cumulative total
    const totals = lines.map((line) => {
      const [date, raw] = line.split(",");

      const num = parseFloat(
        raw.trim().startsWith(".") ? "0" + raw.trim() : raw.trim()
      );

      // convert atto → ASHM
      return {
        date,
        total: num / 1e18,
      };
    });

    // превращаем в приросты по дням
    const data = [];

for (let i = 1; i < totals.length; i++) {
  const diff = totals[i].total - totals[i - 1].total;

  if (diff > 0) {
    const d = new Date(totals[i].date);
    const formatted =
      `${String(d.getDate()).padStart(2, "0")}.` +
      `${String(d.getMonth() + 1).padStart(2, "0")}`;

    data.push({
      date: formatted,
      rewards: diff,
    });
  }
}
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
