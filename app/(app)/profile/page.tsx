"use client";
import { getWallet } from "@/lib/api/client";
import { decodeJwt } from "@/lib/auth/token";
import { useAuth } from "@/lib/auth/AuthContext";
import { initial, money } from "@/lib/format";
import { Theme, useTheme } from "@/lib/theme";
import { useAsync } from "@/lib/useAsync";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { Icon, IconName } from "@/components/ui/icons";

const Row = ({ k, v, mono }: { k: string; v?: string; mono?: boolean }) => (
  <div className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between">
    <dt className="text-sm text-muted">{k}</dt>
    <dd className={`break-all text-sm font-medium sm:text-right ${mono ? "font-mono text-xs" : ""}`}>{v || "-"}</dd>
  </div>
);

export default function ProfilePage() {
  const { user, token, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { data } = useAsync(getWallet, []);
  const name = data?.user?.username ?? user.username ?? data?.user?.email ?? user.email ?? "Account";
  const email = data?.user?.email ?? user.email;
  const exp = decodeJwt(token).exp;
  const since = data?.createdAt ? new Date(data.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : undefined;
  const modes: [Theme, string, IconName][] = [["light", "Light", "sun"], ["dark", "Dark", "moon"], ["system", "System", "monitor"]];
  return (
    <>
      <PageHeader title="Profile" subtitle="Your account and wallet details." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center lg:self-start !p-8">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-accent to-[#6382e6] text-4xl font-semibold text-accent-fg shadow-lift ring-4 ring-surface">{initial(name)}</div>
          <h2 className="mt-5 max-w-full truncate text-xl font-semibold">{name}</h2>
          {email && <p className="mt-1 max-w-full truncate text-sm text-muted">{email}</p>}
          <div className="mt-4"><Badge value="Session active" /></div>
          <Button variant="secondary" className="mt-8 w-full text-neg" onClick={logout}><Icon name="logout" />Log out</Button>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card delay={80}>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="wallet" />Account and wallet</h2>
            <dl className="mt-2 divide-y divide-line">
              <Row k="Username" v={data?.user?.username ?? user.username} />
              <Row k="Email" v={email} />
              <Row k="Wallet ID" v={data?.id} mono />
              <Row k="Current balance" v={data ? money(data.balance) : "..."} />
              {since && <Row k="Member since" v={since} />}
              {exp && <Row k="Session expires" v={new Date(exp * 1000).toLocaleString()} />}
            </dl>
          </Card>
          <Card delay={160}>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><Icon name="sun" />Appearance</h2>
            <p className="mb-4 mt-1 text-sm text-muted">Choose how Wallet looks. System follows your device.</p>
            <div className="grid max-w-md grid-cols-3 gap-1 rounded-xl bg-surface2 p-1">
              {modes.map(([m, l, i]) => (
                <button key={m} onClick={() => setTheme(m)} aria-pressed={theme === m} className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${theme === m ? "bg-surface text-fg shadow-soft" : "text-muted hover:text-fg"}`}><Icon name={i} size={16} />{l}</button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
