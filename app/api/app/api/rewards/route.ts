import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_STATS_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_STATS_URL is not defined" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${baseUrl}/rewards.csv`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch rewards.csv");
    }

    const text = await res.text();

    const lines = text.trim().split("\n").slice(1); // skip header
    const data = lines.map((line) => {
      const [date, value] = line.split(",");
      return {
        date,
        rewards: Number(value),
      };
    });

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load rewards" },
      { status: 500 }
    );
  }
}
