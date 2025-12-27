export async function GET() {
  try {
    const r = await fetch("http://technodes.duckdns.org/delegations.json");
    return new Response(await r.text(), { status: r.status });
  } catch (e) {
    return new Response("failed: " + String(e), { status: 500 });
  }
}
