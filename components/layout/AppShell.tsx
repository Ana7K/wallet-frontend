"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { initial } from "@/lib/format";
import { Theme, useTheme } from "@/lib/theme";
import { Icon, IconName } from "@/components/ui/icons";
import Atmosphere from "./Atmosphere";

const NAV: [string, string, IconName][] = [
  ["/dashboard", "Dashboard", "dashboard"], ["/transactions", "Transactions", "list"], ["/transfer", "Transfer", "send"],
  ["/top-up", "Top up", "topup"], ["/analytics", "Analytics", "chart"],
];

function ThemeToggle() {
  const { resolved, setTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <button onClick={() => setTheme(next)} aria-label={`Switch to ${next} mode`} className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-surface/70 text-muted transition hover:text-fg hover:shadow-soft active:scale-95">
      <Icon name={resolved === "dark" ? "sun" : "moon"} />
    </button>
  );
}

function AccountMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const down = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); };
  }, [open]);
  const name = user.username ?? user.email ?? "Account";
  const modes: [Theme, string, IconName][] = [["light", "Light", "sun"], ["dark", "Dark", "moon"], ["system", "Auto", "monitor"]];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open} aria-label="Account menu"
        className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-accent to-[#6382e6] text-sm font-bold text-accent-fg ring-2 ring-transparent transition hover:ring-accent/30 active:scale-95">{initial(name)}</button>
      {open && (
        <div role="menu" className="absolute right-0 mt-3 w-72 origin-top-right animate-pop rounded-2xl border border-line bg-surface p-2 shadow-lift">
          <div className="px-3 py-3"><p className="truncate text-sm font-semibold">{name}</p>{user.email && <p className="truncate text-xs text-muted">{user.email}</p>}</div>
          <Link href="/profile" role="menuitem" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-fg/5"><Icon name="user" />View profile</Link>
          <div className="px-3 py-2">
            <p className="mb-2 text-xs font-medium text-muted">Appearance</p>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface2 p-1">
              {modes.map(([m, l, i]) => (
                <button key={m} onClick={() => setTheme(m)} aria-pressed={theme === m}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${theme === m ? "bg-surface text-fg shadow-soft" : "text-muted hover:text-fg"}`}><Icon name={i} size={14} />{l}</button>
              ))}
            </div>
          </div>
          <button onClick={logout} role="menuitem" className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-neg transition hover:bg-neg/10"><Icon name="logout" />Log out</button>
        </div>
      )}
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const { token, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();
  useEffect(() => { if (ready && !token) router.replace("/login"); }, [ready, token, router]);
  if (!ready || !token) return <><Atmosphere /><p className="p-10 text-center text-sm text-muted">Loading...</p></>;

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Atmosphere />
      <header className="sticky top-0 z-30 border-b border-line/60 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 md:px-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-[#6382e6] text-accent-fg shadow-soft"><Icon name="wallet" size={17} /></span>Wallet
          </Link>
          <nav aria-label="Main" className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(([h, l]) => {
              const on = path === h;
              return (
                <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`relative rounded-lg px-3 py-2 text-sm font-medium transition ${on ? "text-fg" : "text-muted hover:text-fg"}`}>
                  {l}
                  <span className={`absolute inset-x-3 -bottom-[14px] h-0.5 rounded-full bg-accent transition-all duration-300 ${on ? "opacity-100" : "scale-x-0 opacity-0"}`} />
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2"><ThemeToggle /><AccountMenu /></div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</main>
      <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        {NAV.map(([h, l, i]) => (
          <Link key={h} href={h} aria-current={path === h ? "page" : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${path === h ? "text-accent" : "text-muted"}`}><Icon name={i} size={20} />{l}</Link>
        ))}
      </nav>
    </div>
  );
}
