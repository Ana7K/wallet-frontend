"use client";
import { useState } from "react";
import { confirmMockPayment } from "@/lib/api/client";
import { Alert, Button, Card, Field, PageHeader } from "@/components/ui";
import TopUpForm from "@/components/forms/TopUpForm";
import WalletSummary from "@/components/wallet/WalletSummary";
import RecentTransactions from "@/components/transactions/RecentTransactions";

export default function TopUpPage() {
  const [key, setKey] = useState(0);
  const [txId, setTxId] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ k: "error" | "success"; t: string } | null>(null);

  async function confirm() {
    if (!txId.trim()) return setMsg({ k: "error", t: "Enter the pending transaction ID." });
    setBusy(true); setMsg(null);
    try { await confirmMockPayment(txId.trim()); setMsg({ k: "success", t: "Payment confirmed. Balance and transactions refreshed." }); setKey((k) => k + 1); }
    catch (x) { setMsg({ k: "error", t: (x as Error).message }); }
    finally { setBusy(false); }
  }
  return (
    <>
      <PageHeader title="Add money" subtitle="Create a top-up, then confirm the payment to credit your wallet." />
      <div className="space-y-8">
        <WalletSummary refreshKey={key} />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-2">
            <Card><h2 className="mb-5 text-lg font-semibold">Create top-up</h2><TopUpForm onCreated={(id) => { if (id) setTxId(id); setKey((k) => k + 1); }} /></Card>
            <Card delay={80}>
              <h2 className="mb-1 text-lg font-semibold">Complete a test payment</h2>
              <p className="mb-5 text-sm text-muted">Top-ups stay pending until the payment provider confirms them. In this demo, confirmation goes through this app's server, which holds the webhook secret. The secret never reaches your browser.</p>
              <div className="space-y-4">
                <Field id="txid" label="Pending transaction ID" value={txId} onChange={(e) => setTxId(e.target.value)} placeholder="Filled in after you create a top-up" />
                {msg && <Alert kind={msg.k}>{msg.t}</Alert>}
                <Button onClick={confirm} disabled={busy}>{busy ? "Confirming..." : "Confirm test payment"}</Button>
              </div>
            </Card>
          </div>
          <div className="lg:col-span-3"><RecentTransactions refreshKey={key} limit={10} onPick={(id) => { setTxId(id); setMsg(null); window.scrollTo({ top: 0, behavior: "smooth" }); }} /></div>
        </div>
      </div>
    </>
  );
}
