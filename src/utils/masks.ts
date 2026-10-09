const digits = (value: string, max: number) =>
  value.replace(/\D/g, "").slice(0, max);

/** "12345678901" -> "123.456.789-01" */
export function maskCpf(value: string) {
  return digits(value, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** "123456789" -> "12.345.678-9". Aceita "X" como dígito verificador. */
export function maskRg(value: string) {
  const clean = value
    .toUpperCase()
    .replace(/[^0-9X]/g, "")
    .slice(0, 9);
  return clean
    .replace(/(\w{2})(\w)/, "$1.$2")
    .replace(/(\w{3})(\w)/, "$1.$2")
    .replace(/(\w{3})(\w)$/, "$1-$2");
}

/** Celular "(11) 91234-5678" ou fixo "(11) 1234-5678", conforme a quantidade de dígitos. */
export function maskPhone(value: string) {
  const d = digits(value, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const area = `(${d.slice(0, 2)}) `;
  const rest = d.slice(2);
  const split = d.length === 11 ? 5 : 4;
  return rest.length > split
    ? `${area}${rest.slice(0, split)}-${rest.slice(split)}`
    : `${area}${rest}`;
}

/** "01310100" -> "01310-100" */
export function maskCep(value: string) {
  return digits(value, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

/** "01022000" -> "01/02/2000" */
export function maskDate(value: string) {
  return digits(value, 8)
    .replace(/(\d{2})(\d)/, "$1/$2")
    .replace(/(\d{2})(\d)/, "$1/$2");
}

/** "01/02/2000" -> "2000-02-01"; `null` se a data for inválida ou futura. */
export function parseBrDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid =
    date.getFullYear() === Number(yyyy) &&
    date.getMonth() === Number(mm) - 1 &&
    date.getDate() === Number(dd) &&
    Number(yyyy) >= 1900 &&
    date <= new Date();
  return valid ? `${yyyy}-${mm}-${dd}` : null;
}

/** Valida os dígitos verificadores do CPF. */
export function isValidCpf(value: string) {
  const d = value.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const check = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i++) sum += Number(d[i]) * (length + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(d[9]) && check(10) === Number(d[10]);
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
