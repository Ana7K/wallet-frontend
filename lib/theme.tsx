"use client";
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
const KEY = "wallet_theme";
const Ctx = createContext<{ theme: Theme; resolved: "light" | "dark"; setTheme: (t: Theme) => void }>({ theme: "system", resolved: "light", setTheme: () => {} });
export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setT] = useState<Theme>("system");
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  const apply = useCallback((t: Theme) => {
    const dark = t === "dark" || (t === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
    setResolved(dark ? "dark" : "light");
  }, []);

  useEffect(() => {
    let saved: Theme = "system";
    try { const s = localStorage.getItem(KEY); if (s === "light" || s === "dark") saved = s; } catch {}
    setT(saved); apply(saved);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => { try { if (!localStorage.getItem(KEY)) apply("system"); } catch {} };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [apply]);

  const setTheme = (t: Theme) => {
    const el = document.documentElement;
    el.classList.add("theme-switching");
    setT(t); apply(t);
    try { if (t === "system") localStorage.removeItem(KEY); else localStorage.setItem(KEY, t); } catch {}
    setTimeout(() => el.classList.remove("theme-switching"), 400);
  };
  return <Ctx.Provider value={{ theme, resolved, setTheme }}>{children}</Ctx.Provider>;
}
