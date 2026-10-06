"use client";
import { useState } from "react";
import { exportCSV, exportPDF, getTransactions } from "@/lib/api/client";
import { useAsync } from "@/lib/useAsync";
import { TxFilters } from "@/types";
import { Alert, Button, Card, PageHeader, Spinner, inputCls } from "@/components/ui";
import TransactionsTable from "@/components/transactions/TransactionsTable";

const input = inputCls;

export default function TransactionsPage() {
  const [f, setF] = useState<TxFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [busy, setBusy] = useState("");
  const [exportErr, setExportErr] = useState("");
  const { data, error, loading, reload } = useAsync(() => getTransactions({ ...f, page, limit }), [f.type, f.from, f.to, page, limit]);

  const set = (k: keyof TxFilters, v: string) => { setF({ ...f, [k]: v || undefined }); setPage(1); };
  const clear = () => { setF({}); setPage(1); };
  const hasNext = data ? (data.totalPages != null ? page < data.totalPages : data.items.length === limit) : false;

  async function doExport(kind: "csv" | "pdf") {
    setBusy(kind); setExportErr("");
    try { await (kind === "csv" ? exportCSV : exportPDF)(f); }
    catch (x) { setExportErr((x as Error).message); }
    finally { setBusy(""); }
  }

  return (
    <>
      <PageHeader title="Transactions" subtitle="Everything that moved in and out of your wallet.">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => doExport("csv")} disabled={!!busy}>{busy === "csv" ? "Exporting..." : "Export CSV"}</Button>
          <Button variant="secondary" onClick={() => doExport("pdf")} disabled={!!busy}>{busy === "pdf" ? "Exporting..." : "Export PDF"}</Button>
        </div>
      </PageHeader>
      <div className="space-y-4">
        <Card>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div><label htmlFor="type" className="mb-1.5 block text-xs font-medium text-muted">Type</label>
              <select id="type" className={`${input} w-full`} value={f.type ?? ""} onChange={(e) => set("type", e.target.value)}>
                <option value="">All</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option>
              </select></div>
            <div><label htmlFor="from" className="mb-1.5 block text-xs font-medium text-muted">From</label><input id="from" type="date" className={`${input} w-full`} value={f.from ?? ""} onChange={(e) => set("from", e.target.value)} /></div>
            <div><label htmlFor="to" className="mb-1.5 block text-xs font-medium text-muted">To</label><input id="to" type="date" className={`${input} w-full`} value={f.to ?? ""} onChange={(e) => set("to", e.target.value)} /></div>
            <div><label htmlFor="limit" className="mb-1.5 block text-xs font-medium text-muted">Per page</label>
              <select id="limit" className={`${input} w-full`} value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
                {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select></div>
            <Button variant="secondary" onClick={clear}>Clear filters</Button>
          </div>
        </Card>
        {exportErr && <Alert kind="error">{exportErr}</Alert>}
        {loading && !data ? <Spinner /> : error ? <div className="space-y-3"><Alert kind="error">{error}</Alert><Button variant="secondary" onClick={reload}>Try again</Button></div> : (
          <>
            <TransactionsTable items={data?.items ?? []} />
            <div className="flex items-center justify-between text-sm">
              <Button variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-muted">Page {page}{data?.totalPages ? ` of ${data.totalPages}` : ""}</span>
              <Button variant="secondary" disabled={!hasNext || loading} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
