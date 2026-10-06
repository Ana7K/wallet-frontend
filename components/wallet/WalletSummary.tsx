"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getWallet } from "@/lib/api/client";
import { money } from "@/lib/format";
import { useAsync } from "@/lib/useAsync";
import { useAuth } from "@/lib/auth/AuthContext";
import { Alert, Button, Card } from "@/components/ui";
import { Icon } from "@/components/ui/icons";

// Animates from the previous balance to the new one.
function useCountUp(target: number) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current, t0 = performance.now();
    prev.current = target;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / 800, 1);
      setV(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
}

const rings = (
  <svg className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] text-white/[0.07]" viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">
    <circle cx="200" cy="200" r="60" /><circle cx="200" cy="200" r="110" /><circle cx="200" cy="200" r="160" /><circle cx="200" cy="200" r="195" />
  </svg>
);

export default function WalletSummary({ refreshKey = 0, actions = false }: { refreshKey?: number; actions?: boolean }) {
  const { data, error, loading, reload } = useAsync(getWallet, [refreshKey]);
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const bal = useCountUp(Number(data?.balance ?? 0));

  if (loading && !data) return <div role="status" aria-label="Loading wallet" className="h-60 animate-shimmer rounded-3xl bg-gradient-to-r from-fg/5 via-fg/10 to-fg/5 bg-[length:200%_100%]" />;
  if (error || !data) return <Card><Alert kind="error">{error || "Could not load wallet."}</Alert><Button variant="secondary" className="mt-3" onClick={reload}>Try again</Button></Card>;

  const name = data.user?.username ?? user.username ?? data.user?.email ?? user.email ?? "Your wallet";
  const short = data.id.length > 14 ? `${data.id.slice(0, 8)}...${data.id.slice(-4)}` : data.id;
  const copy = () => { navigator.clipboard?.writeText(data.id); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  const act = "inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-px active:scale-[.98]";

  return (
    <section aria-label="Wallet balance" className="relative animate-rise overflow-hidden rounded-3xl border border-white/10 p-6 text-white shadow-lift md:p-9" style={{ background: "linear-gradient(135deg,#0A1624 0%,#0D2D38 55%,#134B45 100%)" }}>
      {rings}
      <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(60% 80% at 100% 0%, rgba(214,190,140,.16), transparent 60%)" }} />
      <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />Available balance</p>
          <p className="num mt-3 text-5xl font-semibold md:text-7xl">{money(bal)}</p>
          <p className="mt-4 text-sm text-white/60">{name}</p>
        </div>
        {actions && (
          <div className="flex flex-wrap gap-3">
            <Link href="/top-up" className={`${act} bg-white text-slate-900 shadow-lift hover:bg-white/90`}><Icon name="topup" />Add money</Link>
            <Link href="/transfer" className={`${act} bg-white/10 ring-1 ring-white/15 hover:bg-white/15`}><Icon name="send" />Transfer</Link>
          </div>
        )}
      </div>
      <div className="relative mt-8 border-t border-white/10 pt-5 text-xs text-white/55">
        <button onClick={copy} aria-label="Copy wallet ID" className="inline-flex items-center gap-2 transition hover:text-white">
          Wallet ID <span className="font-mono text-white/80">{short}</span><Icon name={copied ? "check" : "copy"} size={14} />
        </button>
      </div>
    </section>
  );
}
