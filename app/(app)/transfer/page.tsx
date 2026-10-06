"use client";
import { useState } from "react";
import { Card, PageHeader } from "@/components/ui";
import TransferForm from "@/components/forms/TransferForm";
import WalletSummary from "@/components/wallet/WalletSummary";
import RecentTransactions from "@/components/transactions/RecentTransactions";

export default function TransferPage() {
  const [key, setKey] = useState(0);
  return (
    <>
      <PageHeader title="Send money" subtitle="Transfer to another wallet using the receiver's email." />
      <div className="space-y-8">
        <WalletSummary refreshKey={key} />
        <div className="grid gap-8 lg:grid-cols-5">
          <Card className="h-fit lg:col-span-2"><h2 className="mb-5 text-lg font-semibold">New transfer</h2><TransferForm onDone={() => setKey((k) => k + 1)} /></Card>
          <div className="lg:col-span-3"><RecentTransactions refreshKey={key} /></div>
        </div>
      </div>
    </>
  );
}
