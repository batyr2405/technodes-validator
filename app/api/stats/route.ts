import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  try {
    const data = fs.readFileSync("/var/www/technodes/stats.json", "utf8");
    const json = JSON.parse(data);

    return NextResponse.json(json, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (e) {
    return NextResponse.json(
      { error: "stats not available" },
      { status: 500 }
    );
  }
}
