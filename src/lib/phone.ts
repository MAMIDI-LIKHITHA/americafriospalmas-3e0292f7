/**
 * Normaliza números brasileiros para o formato E.164 (+55DDDNÚMERO).
 * Aceita "(63) 99999-9999", "63 99999-9999", "+55 63 99999-9999", "5563999999999".
 * Retorna null se não for um celular/fixo brasileiro válido.
 */
export function normalizeBrPhone(input: string): string | null {
  let digits = (input ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length !== 10 && digits.length !== 11) return null;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;
  if (digits.length === 11 && digits[2] !== "9") return null;
  return `+55${digits}`;
}

/** Máscara de digitação: (63) 99999-9999 */
export function maskBrPhone(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("55") && d.length > 11) d = d.slice(2);
  d = d.slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Formata o telefone do usuário autenticado (ex.: "5563999999999") para exibição. */
export function displayBrPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  const n = normalizeBrPhone(phone);
  if (!n) return phone;
  return `+55 ${maskBrPhone(n.slice(3))}`;
}
