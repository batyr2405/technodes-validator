import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET() {
  try {
    const res = await fetch("http://technodes.duckdns.org/rewards.csv", {
      cache: "no-store",
    });

    if (!res.ok) throw new Error("failed to fetch rewards.csv");

    const text = await res.text();
    const lines = text.trim().split("\n").slice(1);

    // абсолютные значения
    const raw = lines.map((line) => {
      const [date, value] = line.split(",");

      return {
        date,
        total: parseFloat(
          value.trim().startsWith(".") ? "0" + value.trim() : value.trim()
        ),
      };
    });

    // превращаем в приросты
    const result = raw
      .map((item, i) => {
        if (i === 0) return null;

        const prev = raw[i - 1];

        return {
          date: item.date,
          rewards: item.total - prev.total,
        };
      })
      .filter(Boolean);

    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
