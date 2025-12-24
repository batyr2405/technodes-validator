import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(
      "http://62.84.177.12:8090/rewards/history",
      { cache: "no-store" }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "failed to fetch rewards history" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "rewards history backend unreachable" },
      { status: 500 }
    );
  }
}
