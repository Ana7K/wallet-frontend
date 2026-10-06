const KEY = "wallet_token";
const PKEY = "wallet_profile";
type Profile = { username?: string; email?: string };

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem(KEY));
export const setToken = (t: string) => localStorage.setItem(KEY, t);
export const clearToken = () => { localStorage.removeItem(KEY); localStorage.removeItem(PKEY); };
export const setProfile = (p: Profile) => localStorage.setItem(PKEY, JSON.stringify(p));
export const getProfile = (): Profile => { try { return JSON.parse(localStorage.getItem(PKEY) ?? "{}"); } catch { return {}; } };

// Reads the (unverified) JWT payload for display only. The backend remains the authority.
export function decodeJwt(t: string | null): { sub?: string; email?: string; exp?: number } {
  try { return t ? JSON.parse(atob(t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))) : {}; } catch { return {}; }
}
