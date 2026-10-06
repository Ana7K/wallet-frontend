import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { Icon, IconName } from "./icons";

export const cx = (...a: (string | false | undefined)[]) => a.filter(Boolean).join(" ");
export const inputCls = "w-full rounded-xl border border-line bg-surface2 px-3.5 py-2.5 text-sm text-fg outline-none transition placeholder:text-muted/70 focus:border-accent focus:ring-4 focus:ring-accent/15";

export function Card({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div style={{ animationDelay: `${delay}ms` }} className={cx("animate-rise rounded-2xl border border-line bg-surface p-5 shadow-soft", className)}>{children}</div>;
}

export function Button({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const v = {
    primary: "bg-gradient-to-b from-accent to-accent/80 text-accent-fg shadow-soft hover:-translate-y-px hover:shadow-lift",
    secondary: "border border-line bg-surface text-fg hover:-translate-y-px hover:bg-surface2",
    ghost: "text-muted hover:bg-fg/5 hover:text-fg",
  }[variant];
  return <button {...p} className={cx("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 active:translate-y-0 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50", v, className)} />;
}

export function Field({ label, id, error, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">{label}</label>
      <input id={id} {...p} aria-invalid={!!error} className={cx(inputCls, error && "border-neg focus:border-neg focus:ring-neg/15")} />
      {error && <p className="mt-1.5 text-xs text-neg">{error}</p>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: "error" | "success" | "info"; children: ReactNode }) {
  const c = { error: "border-neg/30 bg-neg/10 text-neg", success: "border-pos/30 bg-pos/10 text-pos", info: "border-line bg-surface2 text-muted" }[kind];
  return <div role="alert" className={cx("animate-pop rounded-xl border px-3.5 py-2.5 text-sm", c)}>{children}</div>;
}

export function Badge({ value }: { value: string }) {
  const v = value.toUpperCase();
  const s = ["SUCCESS", "COMPLETED", "INCOME"].includes(v) ? "bg-pos/10 text-pos" : ["FAILED", "EXPENSE"].includes(v) ? "bg-neg/10 text-neg" : v === "PENDING" ? "bg-warn/10 text-warn" : "bg-fg/5 text-muted";
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold", s)}>
      <span className={cx("h-1.5 w-1.5 rounded-full bg-current", v === "PENDING" && "animate-dot")} />{value || "-"}
    </span>
  );
}

export function Spinner() {
  return (
    <div role="status" className="space-y-3">
      {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-shimmer rounded-2xl bg-gradient-to-r from-fg/5 via-fg/10 to-fg/5 bg-[length:200%_100%]" />)}
      <span className="sr-only">Loading. The server may take a moment to wake up.</span>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex animate-rise flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-3xl font-semibold tracking-tight">{title}</h1>{subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}</div>
      {children}
    </div>
  );
}

export function Stat({ label, value, tone, icon, delay = 0 }: { label: string; value: string; tone?: "pos" | "neg"; icon?: IconName; delay?: number }) {
  return (
    <Card delay={delay} className="flex items-center gap-4 !p-4">
      {icon && <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", tone === "pos" ? "bg-pos/10 text-pos" : tone === "neg" ? "bg-neg/10 text-neg" : "bg-fg/5 text-muted")}><Icon name={icon} /></span>}
      <div className="min-w-0"><p className="text-xs font-medium text-muted">{label}</p><p className="num mt-0.5 truncate text-xl font-semibold">{value}</p></div>
    </Card>
  );
}
