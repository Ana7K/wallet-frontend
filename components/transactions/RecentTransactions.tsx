"use client";
import Link from "next/link";
import { getTransactions } from "@/lib/api/client";
import { useAsync } from "@/lib/useAsync";
import { Alert, Button, Spinner } from "@/components/ui";
import TransactionsTable from "./TransactionsTable";

export default function RecentTransactions({ refreshKey = 0, limit = 5, onPick }: { refreshKey?: number; limit?: number; onPick?: (id: string) => void }) {
  const { data, error, loading, reload } = useAsync(() => getTransactions({ page: 1, limit }), [refreshKey, limit]);
  return (
    <section aria-labelledby="recent">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="recent" className="text-lg font-semibold">Recent activity</h2>
        <Link href="/transactions" className="text-sm font-semibold text-accent hover:underline">View all</Link>
      </div>
      {loading && !data ? <Spinner /> : error ? <div className="space-y-3"><Alert kind="error">{error}</Alert><Button variant="secondary" onClick={reload}>Try again</Button></div> : <TransactionsTable items={data?.items ?? []} onPick={onPick} />}
    </section>
  );
}
