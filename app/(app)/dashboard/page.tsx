"use client";
import Link from "next/link";
import { getAnalytics } from "@/lib/api/client";
import { money } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { useAuth } from "@/lib/auth/AuthContext";
import { Alert, PageHeader, Stat } from "@/components/ui";
import WalletSummary from "@/components/wallet/WalletSummary";
import RecentTransactions from "@/components/transactions/RecentTransactions";

export default function DashboardPage() {
  const { data, error } = useAsync(getAnalytics, []);
  const { user } = useAuth();
  const h = new Date().getHours();
  const hello = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  const inc = Number(data?.totalIncome ?? 0), exp = Number(data?.totalExpense ?? 0);
  return (
    <>
      <PageHeader title={user.username ? `${hello}, ${user.username}` : hello} subtitle="Here is where your money stands today." />
      <div className="space-y-8">
        <WalletSummary actions />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2"><RecentTransactions /></div>
          <aside className="space-y-4">
            <h2 className="text-lg font-semibold">Summary</h2>
            {error ? <Alert kind="error">{error}</Alert> : (
              <>
                <Stat label="Total income" value={data ? money(inc) : "..."} tone="pos" icon="down" delay={80} />
                <Stat label="Total expenses" value={data ? money(exp) : "..."} tone="neg" icon="up" delay={140} />
                <Stat label="Net" value={data ? money(inc - exp) : "..."} tone={inc - exp >= 0 ? "pos" : "neg"} icon="chart" delay={200} />
              </>
            )}
            <Link href="/analytics" className="inline-block text-sm font-semibold text-accent hover:underline">View analytics</Link>
          </aside>
        </div>
      </div>
    </>
  );
}
