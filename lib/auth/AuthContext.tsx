"use client";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api/client";
import { clearToken, decodeJwt, getProfile, getToken, setProfile, setToken } from "./token";

type AuthUser = { id?: string; email?: string; username?: string };
type Ctx = {
  token: string | null; ready: boolean; user: AuthUser;
  login: (email: string, password: string) => Promise<void>;
  register: (d: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};
const C = createContext<Ctx>(null!);
export const useAuth = () => useContext(C);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [token, setT] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser>({});
  const [ready, setReady] = useState(false);

  const sync = (t: string | null) => {
    const j = decodeJwt(t), p = getProfile();
    setUser(t ? { id: j.sub, email: j.email ?? p.email, username: p.username } : {});
  };
  useEffect(() => { const t = getToken(); setT(t); sync(t); setReady(true); }, []);
  const save = (t: string) => { setToken(t); setT(t); sync(t); };

  const value: Ctx = {
    token, ready, user,
    login: async (email, password) => save((await api.login({ email, password })).access_token),
    register: async (d) => {
      const res = await api.register(d);
      setProfile({ username: res.user?.username ?? d.username, email: res.user?.email ?? d.email });
      save(res.access_token);
    },
    logout: () => { clearToken(); setT(null); setUser({}); router.replace("/login"); },
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
