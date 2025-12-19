// app/api/rewards/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // пока просто тестовый ответ
    return NextResponse.json({
      ok: true,
      rewards_24h: 0.067914,
      apr: 5.62,
      updated: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load rewards" },
      { status: 500 }
    );
  }
}
