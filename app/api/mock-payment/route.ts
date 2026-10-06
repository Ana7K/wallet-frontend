// Server-only proxy for the mock payment webhook. WEBHOOK_SECRET stays on the server.
// Demo use only: enable with ENABLE_MOCK_PAYMENT=true. Never expose the secret via NEXT_PUBLIC_*.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const reply = (message: string, status: number) =>
  Response.json({ message }, { status });

export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SECRET;
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const missing = [
    process.env.ENABLE_MOCK_PAYMENT !== "true" && "ENABLE_MOCK_PAYMENT=true",
    !secret && "WEBHOOK_SECRET",
    !base && "NEXT_PUBLIC_API_URL",
  ].filter(Boolean);
  if (missing.length)
    return reply(
      `Test payments are not enabled. Missing or incorrect server env: ${missing.join(", ")}.`,
      403,
    );

  const auth = req.headers.get("authorization");
  if (!auth) return reply("Not authenticated.", 401);
  const me = await fetch(`${base}/wallet`, {
    headers: { Authorization: auth },
  }).catch(() => null);
  if (!me?.ok)
    return reply("Your session has expired. Please log in again.", 401);

  const { transaction_id } = (await req.json().catch(() => ({}))) as {
    transaction_id?: string;
  };
  if (!transaction_id || !UUID.test(transaction_id))
    return reply("Enter a valid transaction ID (UUID).", 400);

  const r = await fetch(`${base}/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-webhook-secret": secret ?? "",
    },
    body: JSON.stringify({ transaction_id, status: "SUCCESS" }),
  }).catch(() => null);
  if (!r) return reply("Could not reach the payment service.", 502);
  const text = await r.text();
  return new Response(text || "{}", {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
