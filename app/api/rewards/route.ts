import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    rewards_24h: 0.067914,
    apr: 5.62,
    updated: new Date().toISOString(),
  });
}
