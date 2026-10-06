"use client";
import { Transaction } from "@/types";
import { money } from "@/lib/format";
import { Badge } from "@/components/ui";
import { Icon, IconName } from "@/components/ui/icons";

const label = (s?: string) => (!s ? "" : s.toUpperCase() === "TOPUP" ? "Top-up" : s.charAt(0).toUpperCase() + s.slice(1).toLowerCase());
const time = (s?: string) => (s ? new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");
const icon = (t: Transaction): IconName => (t.category?.toUpperCase() === "TOPUP" ? "topup" : t.type === "EXPENSE" ? "up" : "down");

function day(s?: string) {
  if (!s) return "Unknown date";
  const d = new Date(s), n = new Date(), y = new Date();
  y.setDate(n.getDate() - 1);
  if (d.toDateString() === n.toDateString()) return "Today";
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "long" });
}

export default function TransactionsTable({ items, onPick }: { items: Transaction[]; onPick?: (id: string) => void }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-fg/5 text-muted"><Icon name="inbox" size={22} /></span>
        <p className="mt-4 font-medium">No transactions yet</p>
        <p className="mt-1 text-sm text-muted">Add money or send a transfer and it will appear here.</p>
      </div>
    );
  }
  const groups: [string, Transaction[]][] = [];
  items.forEach((t) => {
    const d = day(t.createdAt), g = groups.find((x) => x[0] === d);
    if (g) g[1].push(t); else groups.push([d, [t]]);
  });
  let n = 0;
  return (
    <div className="space-y-6">
      {groups.map(([d, list]) => (
        <section key={d}>
          <h3 className="mb-2 px-1 text-xs font-semibold text-muted">{d}</h3>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
            {list.map((t) => {
              const exp = t.type === "EXPENSE";
              return (
                <li key={t.id} style={{ animationDelay: `${Math.min(n++, 12) * 40}ms` }} className="group flex animate-rise items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface2 md:px-5">
                  <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105 ${exp ? "bg-neg/10 text-neg" : "bg-pos/10 text-pos"}`}><Icon name={icon(t)} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.description || label(t.category) || label(t.type)}</p>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                      <span>{label(t.category) || label(t.type)}</span>
                      {t.counterparty && <span className="truncate">{exp ? "To" : "From"} {t.counterparty}</span>}
                      <span>{time(t.createdAt)}</span>
                    </p>
                    <p className="mt-1 flex items-center gap-3 text-[11px] text-muted">
                      <span className="font-mono" title={t.id}>ID {t.id.slice(0, 8)}</span>
                      <button type="button" onClick={() => navigator.clipboard?.writeText(t.id)} className="font-medium text-accent hover:underline">Copy</button>
                      {onPick && t.status.toUpperCase() === "PENDING" && <button type="button" onClick={() => onPick(t.id)} className="font-medium text-accent hover:underline">Use for test payment</button>}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className={`num text-sm font-semibold md:text-base ${exp ? "text-fg" : "text-pos"}`}>{exp ? "-" : "+"}{money(t.amount)}</p>
                    <div className="mt-1"><Badge value={t.status} /></div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
