import { NextResponse } from "next/server";
import fs from "fs/promises";

export const dynamic = "force-dynamic";

const FILE = "/root/shardeum-evm/snapshots/delegations.json";

export async function GET() {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json({
      validator: data.validator,
      total_stake: data.total_stake,
      diff: data.diff,
      new_delegations: data.new_delegations,
      updated: data.updated,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Delegations snapshot unavailable" },
      { status: 500 }
    );
  }
}

