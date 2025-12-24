import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = "/root/shardeum-evm/rewards.csv";

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "rewards.csv not found" },
        { status: 404 }
      );
    }

    const raw = fs.readFileSync(filePath, "utf-8").trim();
    const lines = raw.split("\n").slice(1); // skip header

    const history = lines.map((line) => {
      const [date, rewards] = line.split(",");
      return {
        date,
        rewards: Number(rewards),
      };
    });

    return NextResponse.json({
      history,
      updated: new Date().toISOString(),
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
