"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Alert, Button, Field } from "@/components/ui";
import AuthShell from "@/components/layout/AuthShell";

export default function LoginPage() {
  const { login, token, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (ready && token) router.replace("/dashboard"); }, [ready, token, router]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true); setError("");
    try { await login(email.trim(), password); router.replace("/dashboard"); }
    catch (x) { setError((x as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <AuthShell title="Welcome back" subtitle="Log in to your wallet.">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field id="password" label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert kind="error">{error}</Alert>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Logging in..." : "Log in"}</Button>
        </form>
        <p className="mt-6 text-sm text-muted">New here? <Link href="/register" className="font-semibold text-accent hover:underline">Create an account</Link></p>
    </AuthShell>
  );
}
