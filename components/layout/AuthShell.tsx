import { ReactNode } from "react";
import Atmosphere from "./Atmosphere";
import { Icon } from "@/components/ui/icons";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <Atmosphere />
      <aside className="relative hidden overflow-hidden p-12 text-white lg:flex lg:flex-col lg:justify-between" style={{ background: "linear-gradient(145deg,#0A1624 0%,#0D2D38 60%,#12463f 100%)" }}>
        <div className="flex items-center gap-2.5 font-semibold"><span className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 ring-1 ring-white/15"><Icon name="wallet" /></span>Wallet</div>
        <svg className="pointer-events-none absolute -bottom-48 -right-48 h-[34rem] w-[34rem] text-white/10" viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden="true">
          <circle cx="200" cy="200" r="60" /><circle cx="200" cy="200" r="110" /><circle cx="200" cy="200" r="160" /><circle cx="200" cy="200" r="195" />
        </svg>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Your money, calmly in order.</h2>
          <p className="mt-4 text-white/65">Add funds, send transfers and review every transaction in one quiet place.</p>
        </div>
        <p className="relative text-xs text-white/40">Your session stays on this device.</p>
      </aside>
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-10 flex items-center gap-2.5 font-semibold lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#6382e6] text-accent-fg"><Icon name="wallet" /></span>Wallet</div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-8 mt-2 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
