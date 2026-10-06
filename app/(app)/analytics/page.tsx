"use client";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAnalytics } from "@/lib/api/client";
import { money } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { useTheme } from "@/lib/theme";
import { Alert, Button, Card, PageHeader, Spinner, Stat } from "@/components/ui";
import { Icon } from "@/components/ui/icons";

export default function AnalyticsPage() {
  const { data, error, loading, reload } = useAsync(getAnalytics, []);
  const { resolved } = useTheme();
  if (loading && !data) return <><PageHeader title="Analytics" /><Spinner /></>;
  if (error || !data) return <><PageHeader title="Analytics" /><div className="space-y-3"><Alert kind="error">{error || "Could not load analytics."}</Alert><Button variant="secondary" onClick={reload}>Try again</Button></div></>;

  const col = resolved === "dark" ? { inc: "#6adca8", exp: "#f7878c", grid: "#212b42", tick: "#8b96ab" } : { inc: "#047857", exp: "#be123c", grid: "#e2e7ef", tick: "#647085" };
  const inc = Number(data.totalIncome), exp = Number(data.totalExpense);
  const monthly = (data.monthly ?? []).map((m) => ({ month: m.month, Income: Number(m.income), Expenses: Number(m.expense) }));
  return (
    <>
      <PageHeader title="Analytics" subtitle="How money has moved in and out of your wallet." />
      <div className="space-y-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total income" value={money(inc)} tone="pos" icon="down" />
          <Stat label="Total expenses" value={money(exp)} tone="neg" icon="up" delay={60} />
          <Stat label="Net" value={money(inc - exp)} tone={inc - exp >= 0 ? "pos" : "neg"} icon="chart" delay={120} />
          <Stat label="Active months" value={String(monthly.length)} icon="list" delay={180} />
        </div>
        <Card delay={200} className="!p-6">
          <h2 className="text-lg font-semibold">Monthly income vs expenses</h2>
          <p className="mb-6 mt-1 text-sm text-muted">Compare each month at a glance.</p>
          {monthly.length === 0 ? (
            <div className="py-14 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fg/5 text-muted"><Icon name="chart" size={22} /></span>
              <p className="mt-4 font-medium">No activity to chart yet</p>
              <p className="mt-1 text-sm text-muted">Add money or send a transfer to see your monthly trend.</p>
            </div>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly} barGap={6} margin={{ left: -8 }}>
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col.inc} /><stop offset="100%" stopColor={col.inc} stopOpacity={0.3} /></linearGradient>
                    <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col.exp} /><stop offset="100%" stopColor={col.exp} stopOpacity={0.3} /></linearGradient>
                  </defs>
                  <CartesianGrid stroke={col.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: col.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: col.tick, fontSize: 12 }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip cursor={{ fill: col.grid, opacity: 0.35 }} formatter={(v) => money(Number(v))}
                    contentStyle={{ background: "rgb(var(--surface))", border: "1px solid rgb(var(--line))", borderRadius: 12, color: "rgb(var(--fg))" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Income" fill="url(#gi)" radius={[6, 6, 0, 0]} animationDuration={900} />
                  <Bar dataKey="Expenses" fill="url(#ge)" radius={[6, 6, 0, 0]} animationDuration={900} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
