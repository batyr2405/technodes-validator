import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const filePath = "/var/www/technodes/delegations.json";

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "delegations data unavailable" },
      { status: 500 }
    );
  }
}
