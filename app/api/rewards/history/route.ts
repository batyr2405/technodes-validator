import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CSV_URL = "http://62.84.177.12/rewards.csv";

export async function GET() {
  try {
    const res = await fetch(CSV_URL, { cache: "no-store" });

    if (!res.ok) {
      throw new Error("CSV fetch failed");
    }

    const text = await res.text();
    const lines = text.trim().split("\n").slice(1); // skip header

    const history = lines.map(line => {
      const [date, rewards] = line.split(",");
      return {
        date,
        rewards: Number(rewards),
      };
    });

    return NextResponse.json(history);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load rewards history" },
      { status: 500 }
    );
  }
}
