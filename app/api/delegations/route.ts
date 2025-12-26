import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const raw = fs.readFileSync(
      "/var/www/technodes/delegations.json",
      "utf8"
    );

    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "delegations api failed" },
      { status: 500 }
    );
  }
}
