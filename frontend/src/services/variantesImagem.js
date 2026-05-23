/**
 * Espelho do `backend/app/utils/variantesImagem.js`.
 *
 * Usamos no frontend quando o payload veio sem `imagens` (ex: cache antigo)
 * ou para componentes que recebem apenas uma URL. A regra de derivação tem
 * que casar exatamente com a do backend, ou srcset apontará para 404.
 */

const REGEX_VARIANTE = /-(original|otimizado|card|thumb)\.(jpe?g|png|webp)$/i;

export function derivarVariantes(foto_url) {
  if (!foto_url || typeof foto_url !== "string") return null;

  const ehAbsolutaExterna =
    /^https?:\/\//i.test(foto_url) && !REGEX_VARIANTE.test(foto_url);
  if (ehAbsolutaExterna) {
    return { otimizado: foto_url, card: foto_url, thumb: foto_url };
  }

  const match = foto_url.match(REGEX_VARIANTE);
  if (!match) {
    return { otimizado: foto_url, card: foto_url, thumb: foto_url };
  }

  const base = foto_url.slice(0, -match[0].length);
  return {
    otimizado: `${base}-otimizado.webp`,
    card: `${base}-card.webp`,
    thumb: `${base}-thumb.webp`,
  };
}

/** Larguras (em px) das variantes geradas pelo pipeline. */
export const LARGURAS_VARIANTES = { thumb: 200, card: 600, otimizado: 1280 };

/**
 * Monta `srcset` a partir de um objeto `imagens` (ou de uma URL única).
 * Excluímos `original` por padrão — costuma ser bem maior que o necessário
 * para qualquer viewport razoável e só queima banda.
 */
export function montarSrcSet(imagens) {
  if (!imagens) return undefined;
  const fontes = [];
  if (imagens.thumb) fontes.push(`${imagens.thumb} ${LARGURAS_VARIANTES.thumb}w`);
  if (imagens.card) fontes.push(`${imagens.card} ${LARGURAS_VARIANTES.card}w`);
  if (imagens.otimizado) fontes.push(`${imagens.otimizado} ${LARGURAS_VARIANTES.otimizado}w`);
  return fontes.length > 1 ? fontes.join(", ") : undefined;
}
