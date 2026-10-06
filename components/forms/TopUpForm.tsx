"use client";
import { FormEvent, useState } from "react";
import { checkout } from "@/lib/api/client";
import { Alert, Button, Field } from "@/components/ui";

export default function TopUpForm({ onCreated }: { onCreated: (transactionId?: string) => void }) {
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ k: "error" | "success"; t: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = Number(amount);
    const er = !amount ? "Amount is required." : !(n > 0) ? "Amount must be greater than zero." : "";
    setErr(er);
    if (er) return;
    setBusy(true);
    try {
      const { transactionId } = await checkout(n);
      setMsg({ k: "success", t: "Top-up created and waiting for payment confirmation." });
      setAmount("");
      onCreated(transactionId);
    } catch (x) {
      setMsg({ k: "error", t: (x as Error).message });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="topup" label="Amount" type="number" step="0.01" min="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} error={err} />
      {msg && <Alert kind={msg.k}>{msg.t}</Alert>}
      <Button type="submit" disabled={busy}>{busy ? "Creating..." : "Top up wallet"}</Button>
    </form>
  );
}
