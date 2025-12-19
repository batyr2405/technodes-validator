import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json([
    { date: "2025-12-18", rewards: 0.101871 },
    { date: "2025-12-18", rewards: 0.067914 }
  ]);
}
