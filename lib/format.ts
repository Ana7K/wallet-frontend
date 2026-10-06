export const money = (v: string | number) =>
  Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const dateTime = (s?: string) => (s ? new Date(s).toLocaleString() : "-");
export const initial = (s?: string) => (s?.trim()[0] ?? "?").toUpperCase();
