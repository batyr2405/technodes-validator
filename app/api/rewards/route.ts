import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const API_URL = "http://62.84.177.12:8090/rewards/history";

export async function GET() {
  try {
    const res = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Rewards API error");
    }

    const history: { date: string; rewards: number }[] = await res.json();

    const rewards24h =
      history.length > 0 ? history[history.length - 1].rewards : 0;

    return NextResponse.json({
      ok: true,
      rewards_24h: rewards24h,
      history,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Failed to load rewards" },
      { status: 500 }
    );
  }
}
