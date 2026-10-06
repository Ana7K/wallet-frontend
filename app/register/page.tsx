"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { Alert, Button, Field } from "@/components/ui";
import AuthShell from "@/components/layout/AuthShell";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [f, setF] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.username.trim()) er.username = "Username is required.";
    if (!EMAIL.test(f.email.trim())) er.email = "Enter a valid email address.";
    if (!f.password) er.password = "Password is required.";
    if (f.confirm !== f.password) er.confirm = "Passwords do not match.";
    setErrs(er); setError("");
    if (Object.keys(er).length) return;
    setBusy(true);
    try { await register({ username: f.username.trim(), email: f.email.trim(), password: f.password }); router.replace("/dashboard"); }
    catch (x) { setError((x as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <AuthShell title="Create your wallet" subtitle="Set up your account in under a minute.">
        <form onSubmit={submit} noValidate className="space-y-4">
          <Field id="username" label="Username" autoComplete="username" value={f.username} onChange={set("username")} error={errs.username} />
          <Field id="email" label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errs.email} />
          <Field id="password" label="Password" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errs.password} />
          <Field id="confirm" label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errs.confirm} />
          {error && <Alert kind="error">{error}</Alert>}
          <Button type="submit" className="w-full" disabled={busy}>{busy ? "Creating account..." : "Create account"}</Button>
        </form>
        <p className="mt-6 text-sm text-muted">Already registered? <Link href="/login" className="font-semibold text-accent hover:underline">Log in</Link></p>
    </AuthShell>
  );
}
