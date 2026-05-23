/**
 * Deriva URLs das variantes (otimizado/card/thumb/original) a partir do
 * `foto_url` persistido em `animais.foto_url` ou `usuarios.foto_url`.
 *
 * O pipeline grava sempre quatro arquivos no padrão:
 *   <hash>-original.<ext>
 *   <hash>-otimizado.webp
 *   <hash>-card.webp
 *   <hash>-thumb.webp
 *
 * O frontend persiste `-otimizado.webp` em foto_url. Para servir srcset
 * responsivo basta substituir o sufixo — sem JOIN, sem mais I/O no DB.
 *
 * URLs externas/legadas (ex: https://exemplo/foto.jpg) são preservadas como
 * `original` apenas. Não inventamos variantes para domínios alheios.
 */

const REGEX_VARIANTE = /-(original|otimizado|card|thumb)\.(jpe?g|png|webp)$/i;

/**
 * @param {string|null|undefined} foto_url
 * @returns {{ otimizado: string, card: string, thumb: string } | null}
 *
 * NOTA: `original` foi deliberadamente excluído do retorno. O sufixo do
 * arquivo original depende do MIME enviado (jpg|png|webp) e essa info não
 * está na URL otimizada, então não dá pra reconstituir com segurança.
 * Como `original` raramente é o que o frontend precisa renderizar, fica
 * acessível apenas via GET /api/uploads/:id quando necessário.
 */
function derivarVariantes(foto_url) {
  if (!foto_url || typeof foto_url !== 'string') return null;

  // URL absoluta de domínio que não controlamos — devolvemos como única.
  const ehAbsolutaExterna =
    /^https?:\/\//i.test(foto_url) &&
    !REGEX_VARIANTE.test(foto_url);
  if (ehAbsolutaExterna) {
    return { otimizado: foto_url, card: foto_url, thumb: foto_url };
  }

  // Caminho próprio (relativo ou absoluto). Deriva variantes por troca de sufixo.
  const match = foto_url.match(REGEX_VARIANTE);
  if (!match) {
    // Sem padrão reconhecível — tratamos como única.
    return { otimizado: foto_url, card: foto_url, thumb: foto_url };
  }

  const base = foto_url.slice(0, -match[0].length);
  return {
    otimizado: `${base}-otimizado.webp`,
    card: `${base}-card.webp`,
    thumb: `${base}-thumb.webp`,
  };
}

module.exports = { derivarVariantes };
