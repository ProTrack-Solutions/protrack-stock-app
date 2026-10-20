const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "2026-08-14" (no fuso local, sem passar por UTC). */
export function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Hoje + `days` em "yyyy-MM-dd". */
export function isoDateFromToday(days: number, today = new Date()) {
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

/** "2026-08-14" (ou "2026-08-14T00:00:00Z") -> "14/08/2026" */
export function formatIsoDate(value: string) {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d.slice(0, 2)}/${m}/${y}` : value;
}

/** "14/08/2026" -> "2026-08-14"; `null` se a data não existir. Aceita datas futuras. */
export function brToIsoDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid =
    date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd) &&
    Number(yyyy) >= 2000;
  return valid ? `${yyyy}-${mm}-${dd}` : null;
}

/** Dias corridos de hoje até a data "yyyy-MM-dd" (negativo se já passou). */
export function daysUntil(isoDate: string, today = new Date()) {
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const base = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - base) / 86_400_000);
}

/** "Vence hoje", "Vence amanhã", "Vence em 19 dias", "Venceu há 3 dias". */
export function dueDistanceLabel(isoDate: string, today = new Date()) {
  const days = daysUntil(isoDate, today);
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanhã";
  if (days > 1) return `Vence em ${days} dias`;
  if (days === -1) return "Venceu ontem";
  return `Venceu há ${-days} dias`;
}
