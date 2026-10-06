import { clearToken, getToken } from "@/lib/auth/token";
import type { Analytics, RegisterResponse, Transaction, TxFilters, TxPage, Wallet } from "@/types";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const FALLBACK: Record<number, string> = {
  401: "Your session has expired. Please log in again.",
  404: "We couldn't find what you were looking for.",
  409: "That already exists or conflicts with existing data.",
  429: "Too many requests. Please wait a moment and try again.",
};

function friendly(status: number, body: any, auth: boolean): string {
  const m = body?.message;
  const text = Array.isArray(m) ? m.join(". ") : typeof m === "string" ? m : "";
  if (status >= 500) return "Something went wrong on the server. Please try again.";
  if (status === 401) return auth ? FALLBACK[401] : text || "Invalid email or password.";
  if (status === 429) return FALLBACK[429];
  return text || FALLBACK[status] || "The request could not be completed.";
}

type Opts = { method?: string; body?: unknown; auth?: boolean; query?: object; base?: string };

async function send(path: string, o: Opts = {}): Promise<Response> {
  const { method = "GET", body, auth = true, query, base = BASE } = o;
  const qs = Object.entries((query ?? {}) as Record<string, unknown>)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join("&");
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000); // Render cold starts can take ~30-60s
  let res: Response;
  try {
    res = await fetch(`${base}${path}${qs ? `?${qs}` : ""}`, {
      method, headers, signal: ctrl.signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    console.error("[api] request failed:", `${base}${path}`, err);
    if ((err as Error).name === "AbortError")
      throw new ApiError(0, "The server took too long to respond. It may be waking up. Please try again in a minute.");
    if (!base && base === BASE)
      throw new ApiError(0, "NEXT_PUBLIC_API_URL is not set. Add it to .env.local (or Vercel env vars) and restart/redeploy.");
    throw new ApiError(0, "The browser could not complete the request. The most common cause is the backend not allowing this site's origin (CORS). Check the browser console for details.");
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) {
    let b: any = null;
    try { b = await res.json(); } catch {}
    if (res.status === 401 && auth) {
      clearToken();
      if (typeof window !== "undefined") window.location.assign("/login");
    }
    throw new ApiError(res.status, friendly(res.status, b, auth));
  }
  return res;
}

async function json<T>(path: string, o?: Opts): Promise<T> {
  const text = await (await send(path, o)).text();
  return (text ? JSON.parse(text) : {}) as T;
}

// ---- Auth ----
export const register = (d: { username: string; email: string; password: string }) =>
  json<RegisterResponse>("/auth/register", { method: "POST", body: d, auth: false });
export const login = (d: { email: string; password: string }) =>
  json<{ access_token: string }>("/auth/login", { method: "POST", body: d, auth: false });

// ---- Wallet ----
export async function getWallet(): Promise<Wallet> {
  const r: any = await json("/wallet");
  const w = r.wallet ?? r;
  return { id: String(w.id ?? ""), balance: String(w.balance ?? "0.00"), user: r.user ?? w.user, createdAt: w.created_at ?? w.createdAt ?? r.user?.created_at ?? r.user?.createdAt };
}

export const transfer = (d: { receiver_email: string; amount: number; description?: string }) =>
  json<unknown>("/wallet/transfer", { method: "POST", body: d });

export async function checkout(amount: number) {
  const r: any = await json("/payments/checkout", { method: "POST", body: { amount } });
  const t = r?.transaction ?? r;
  return { transactionId: (t?.transaction_id ?? t?.transactionId ?? t?.id) as string | undefined };
}

function toTx(t: any): Transaction {
  const c = t.counterparty;
  return {
    id: String(t.id), type: String(t.type ?? ""), category: t.category, amount: String(t.amount ?? "0"),
    status: String(t.status ?? ""), description: t.description ?? undefined, createdAt: t.created_at ?? t.createdAt,
    counterparty: typeof c === "string" ? c : c?.email ?? c?.username ?? t.counterparty_email ?? t.receiver_email ?? t.sender_email,
  };
}

export async function getTransactions(q: TxFilters & { page: number; limit: number }): Promise<TxPage> {
  const r: any = await json("/wallet/transactions", { query: q });
  const list: any[] = Array.isArray(r) ? r : r.data ?? r.items ?? r.transactions ?? [];
  const m = r.meta ?? r.pagination ?? r;
  const total = m.total ?? m.totalItems ?? m.count;
  return {
    items: list.map(toTx), page: Number(m.page ?? q.page), limit: Number(m.limit ?? q.limit), total,
    totalPages: m.totalPages ?? m.lastPage ?? (total != null ? Math.ceil(total / q.limit) : undefined),
  };
}

export const getAnalytics = () => json<Analytics>("/wallet/analytics");

async function download(path: string, q: TxFilters, fallback: string) {
  const res = await send(path, { query: q });
  const blob = await res.blob();
  const name = /filename="?([^";]+)"?/i.exec(res.headers.get("content-disposition") ?? "")?.[1] ?? fallback;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
export const exportCSV = (q: TxFilters) => download("/wallet/transactions/export", q, "transactions.csv");
export const exportPDF = (q: TxFilters) => download("/wallet/transactions/export/pdf", q, "transactions.pdf");

// Calls this app's own server route (which holds WEBHOOK_SECRET), not the backend directly.
export const confirmMockPayment = (transaction_id: string) =>
  json<unknown>("/api/mock-payment", { method: "POST", body: { transaction_id }, base: "" });
