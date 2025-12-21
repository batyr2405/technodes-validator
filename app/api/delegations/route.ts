import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch("http://62.84.177.12/delegations.json", {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "delegations data unavailable" },
        { status: 500 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "delegations api failed" },
      { status: 500 }
    );
  }
}
