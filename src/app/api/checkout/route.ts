import { createCheckout, shopifyConfigured, validateLines } from "@/lib/shopify";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
  const lines = validateLines((body as { items?: unknown })?.items);
  if (!lines) return Response.json({ error: "Your bag has something we couldn't recognise." }, { status: 400 });

  // Preview builds: no store connected yet, so say so plainly instead of pretending.
  if (!shopifyConfigured()) return Response.json({ mode: "demo" });

  const result = await createCheckout(lines);
  if ("error" in result) return Response.json(result, { status: 502 });
  return Response.json({ mode: "live", url: result.url });
}
