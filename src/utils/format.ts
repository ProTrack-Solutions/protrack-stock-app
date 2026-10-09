const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/** 1234.5 -> "R$ 1.234,50" */
export function formatCurrency(value: number) {
  const [integer, decimals] = Math.abs(value).toFixed(2).split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${value < 0 ? "- " : ""}R$ ${grouped},${decimals}`;
}

/** "05 de outubro de 2026" */
export function formatLongDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

/** "05 de out." */
export function formatShortDate(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  return `${day} de ${MONTHS[date.getMonth()].slice(0, 3)}.`;
}
