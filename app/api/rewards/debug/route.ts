import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const urls = [
    "http://technodes.duckdns.org/rewards.json",
    "http://technodes.duckdns.org/rewards.csv",
  ];

  const results: any = {};

  for (const url of urls) {
    try {
      const r = await fetch(url, { cache: "no-store" });

      results[url] = {
        ok: r.ok,
        status: r.status,
        contentType: r.headers.get("content-type"),
      };
    } catch (e: any) {
      results[url] = { error: e?.message || String(e) };
    }
  }

  return NextResponse.json(results);
}
