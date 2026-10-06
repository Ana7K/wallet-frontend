"use client";
import { FormEvent, useState } from "react";
import { transfer } from "@/lib/api/client";
import { Alert, Button, Field } from "@/components/ui";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TransferForm({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ k: "error" | "success"; t: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    const n = Number(amount);
    const er: Record<string, string> = {};
    if (!email.trim()) er.email = "Receiver email is required.";
    else if (!EMAIL.test(email.trim())) er.email = "Enter a valid email address.";
    if (!amount) er.amount = "Amount is required.";
    else if (!(n > 0)) er.amount = "Amount must be greater than zero.";
    setErrs(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await transfer({ receiver_email: email.trim(), amount: n, description: desc.trim() || undefined });
      setMsg({ k: "success", t: "Transfer sent." });
      setEmail(""); setAmount(""); setDesc("");
      onDone();
    } catch (x) {
      setMsg({ k: "error", t: (x as Error).message });
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Field id="email" label="Receiver email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errs.email} autoComplete="off" />
      <Field id="amount" label="Amount" type="number" step="0.01" min="0.01" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} error={errs.amount} />
      <Field id="desc" label="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
      {msg && <Alert kind={msg.k}>{msg.t}</Alert>}
      <Button type="submit" disabled={busy}>{busy ? "Sending..." : "Send money"}</Button>
    </form>
  );
}
