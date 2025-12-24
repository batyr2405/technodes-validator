import { NextResponse } from "next/server";

export async function GET() {
  try {
    // читаем CSV напрямую с твоего сервера
    const res = await fetch("http://62.84.177.12/rewards.csv", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("failed to fetch rewards.csv");
    }

    const text = await res.text();

    // Разбираем CSV
    const lines = text.trim().split("\n").slice(1); // пропускаем header

    const data = lines.map((line) => {
      const [date, rewards] = line.split(",");

      return {
        date,
        rewards: parseFloat(rewards),
      };
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
