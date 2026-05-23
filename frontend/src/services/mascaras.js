/**
 * Máscaras leves para inputs. Cada função recebe a string crua digitada
 * pelo usuário e devolve a versão formatada, sem dependências externas.
 */

/** Formata telefone brasileiro: (11) 99999-9999 ou (11) 9999-9999. */
export function mascaraTelefone(valor) {
  const digitos = String(valor || "").replace(/\D/g, "").slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** Mantém apenas 2 letras maiúsculas (UF). */
export function mascaraUF(valor) {
  return String(valor || "")
    .replace(/[^A-Za-z]/g, "")
    .slice(0, 2)
    .toUpperCase();
}
